import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5000;
const MAX_MESSAGE_LENGTH = 8000;
/** How long a single model gets to produce its first token before we fall back. */
const FIRST_TOKEN_TIMEOUT_MS = Number(process.env.GEMINI_FIRST_TOKEN_TIMEOUT_MS) || 45000;
/** Upper bound for the non-streaming endpoint. */
const COMPLETE_TIMEOUT_MS = Number(process.env.GEMINI_COMPLETE_TIMEOUT_MS) || 60000;

/**
 * Models are tried in order. Override the list with GEMINI_MODELS
 * (comma separated) when a model is retired or unavailable in your region.
 */
const DEFAULT_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
];

/** A model only becomes the preferred choice if its first token is this quick. */
const FAST_MODEL_MS = 15000;

const MODELS = (process.env.GEMINI_MODELS || "")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const models = MODELS.length > 0 ? MODELS : DEFAULT_MODELS;

/**
 * Remembers the last model that actually answered so a congested model at the
 * top of the list doesn't cost every request a timeout.
 */
let healthyModel = null;

function orderedModels() {
  if (!healthyModel || !models.includes(healthyModel)) return models;
  return [healthyModel, ...models.filter((model) => model !== healthyModel)];
}

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================================
   Gemini client
   ========================================================= */

let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

function isRetryable(error) {
  const status = error?.status || error?.error?.status;
  const code = error?.code || error?.error?.code;
  return (
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    code === 503 ||
    code === 429
  );
}

function friendlyError(error) {
  const status = error?.status || error?.error?.status;
  const code = error?.code || error?.error?.code;

  if (status === "UNAVAILABLE" || code === 503) {
    return "Gemini is temporarily unavailable. Try again in a few seconds.";
  }
  if (status === "RESOURCE_EXHAUSTED" || code === 429) {
    return "The API rate limit was reached. Wait a moment, then try again.";
  }
  if (
    status === "API_KEY_INVALID" ||
    status === "UNAUTHENTICATED" ||
    status === "PERMISSION_DENIED" ||
    code === 401 ||
    code === 403
  ) {
    return "The Gemini API key was rejected. Check GEMINI_API_KEY in .env.";
  }
  if (status === "NOT_FOUND" || code === 404) {
    return "That Gemini model is no longer available for this key. Update GEMINI_MODELS in .env.";
  }
  if (error?.name === "AbortError" || error?.name === "TimeoutError") {
    return "Gemini took too long to answer. Please try again.";
  }
  return "The model couldn't answer that. Please try again.";
}

function logFailure(model, error) {
  const status = error?.status || error?.error?.status || error?.code || error?.error?.code;
  const detail = String(error?.message || "").slice(0, 160);
  console.warn(
    `[gemini] ${model} failed${status ? ` (${status})` : ""}${detail ? `: ${detail}` : ""}`
  );
}

/**
 * Starts a Gemini stream and waits for the first chunk with a bounded timeout,
 * so one congested model falls through to the next instead of stalling.
 */
async function openStream(ai, model, contents) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRST_TOKEN_TIMEOUT_MS);
  const started = Date.now();

  try {
    const iterator = await ai.models.generateContentStream({
      model,
      contents,
      config: { abortSignal: controller.signal },
    });
    const first = await iterator.next();
    return { iterator, first, firstTokenMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Turns the client transcript into Gemini `contents`. Only plain text turns
 * are accepted, and the tail is capped so a long thread can't blow the
 * request size budget.
 */
function buildContents(message, history) {
  const raw = Array.isArray(history) ? history.slice(-24) : [];
  const turns = [];

  for (const turn of raw) {
    if (
      !turn ||
      typeof turn.content !== "string" ||
      turn.content.trim() === "" ||
      (turn.role !== "user" && turn.role !== "model" && turn.role !== "assistant")
    ) {
      continue;
    }

    const role = turn.role === "assistant" ? "model" : turn.role;
    const text = turn.content.slice(0, MAX_MESSAGE_LENGTH);
    const last = turns[turns.length - 1];

    // Gemini expects alternating turns; merge consecutive same-role messages.
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${text}`;
    } else {
      turns.push({ role, parts: [{ text }] });
    }
  }

  return [...turns, { role: "user", parts: [{ text: message }] }];
}

function readMessage(body) {
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return { error: "Message is required." };
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: `That message is too long (${MAX_MESSAGE_LENGTH} characters max).` };
  }
  return { message };
}

/* =========================================================
   Routes
   ========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    configured: Boolean(process.env.GEMINI_API_KEY),
    models,
    activeModel: healthyModel || models[0],
    uptime: Math.round(process.uptime()),
  });
});

/**
 * Server-sent events stream: `data: {"text":"..."}` chunks, then `[DONE]`.
 */
app.post("/api/chat/stream", async (req, res) => {
  const { message, error } = readMessage(req.body);
  if (error) return res.status(400).json({ error });

  if (!process.env.GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ error: "GEMINI_API_KEY is not configured on the server. Add it to .env and restart." });
  }

  const ai = getClient();
  const contents = buildContents(message, req.body?.history);

  let active = null;
  let lastError = null;

  for (const model of orderedModels()) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const { iterator, first, firstTokenMs } = await openStream(ai, model, contents);

        // A model that immediately ends without text is useless here; fall
        // through to the next candidate instead of showing an empty reply.
        if (first.done && !first.value?.text) {
          throw Object.assign(new Error("Empty response"), { status: "UNAVAILABLE" });
        }

        active = { model, iterator, first, firstTokenMs };
        break;
      } catch (caught) {
        lastError = caught;
        logFailure(model, caught);
        if (!isRetryable(caught)) break;
        if (attempt === 0) await sleep(400);
      }
    }
    if (active) break;
  }

  if (!active) {
    return res.status(503).json({ error: friendlyError(lastError) });
  }

  healthyModel = active.firstTokenMs <= FAST_MODEL_MS ? active.model : null;

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;
  req.on("close", () => {
    closed = true;
  });

  const write = (payload) => {
    if (!closed) res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const emit = (chunk) => {
    const piece = chunk?.text;
    if (piece) write({ text: piece });
  };

  try {
    emit(active.first.value);

    while (!closed) {
      const { value, done } = await active.iterator.next();
      if (done) break;
      emit(value);
    }

    if (!closed) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (caught) {
    console.error("[gemini] stream interrupted:", caught?.message || caught);
    write({ error: "The reply stopped unexpectedly. Please try again." });
    if (!closed) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

/**
 * Buffered endpoint kept for older clients and environments where a proxy
 * buffers event streams.
 */
app.post("/api/chat", async (req, res) => {
  const { message, error } = readMessage(req.body);
  if (error) return res.status(400).json({ error });

  const ai = getClient();
  if (!ai) {
    return res
      .status(500)
      .json({ error: "GEMINI_API_KEY is not configured on the server. Add it to .env and restart." });
  }

  const contents = buildContents(message, req.body?.history);
  let lastError = null;

  for (const model of orderedModels()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { abortSignal: AbortSignal.timeout(COMPLETE_TIMEOUT_MS) },
      });
      if (!response.text) throw new Error("Empty response");
      healthyModel = model;
      return res.status(200).json({ reply: response.text, model });
    } catch (caught) {
      lastError = caught;
      logFailure(model, caught);
      if (isRetryable(caught)) await sleep(400);
    }
  }

  return res.status(503).json({ error: friendlyError(lastError) });
});

/* =========================================================
   Static client (after `npm run build`)
   ========================================================= */

const distDir = path.resolve(__dirname, "../../dist");

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false, maxAge: "1h" }));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      ok: true,
      message: "Gemini API is running. Start the client with `npm run dev`.",
    });
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  // Body parser failures are client mistakes, not server failures.
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "The request body is not valid JSON." });
  }
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "That request is too large." });
  }

  console.error("[server]", error?.message || error);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
});

/* =========================================================
   Start
   ========================================================= */

const server = app.listen(PORT, () => {
  console.log(`\n  Gemini API  http://localhost:${PORT}`);
  console.log(
    process.env.GEMINI_API_KEY
      ? "  API key     loaded\n"
      : "  API key     missing — add GEMINI_API_KEY to .env\n"
  );
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n  Port ${PORT} is already in use. Stop the other server or set PORT in .env.\n`);
    process.exit(1);
  }
  throw error;
});

// Close cleanly so nodemon/concurrently restarts never leave the port bound.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}

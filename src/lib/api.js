const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Reads the API key / model configuration from the server so the UI can
 * explain what is missing instead of failing on the first message.
 */
export async function getHealth() {
  try {
    const response = await fetch(`${BASE}/api/health`, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function parseSseBlock(raw) {
  let event = "message";
  const data = [];

  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data.push(line.slice(5).replace(/^ /, ""));
    }
  }

  if (data.length === 0) return null;
  return { event, data: data.join("\n") };
}

async function readError(response) {
  const fallback = `Request failed (${response.status}).`;
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const parsed = JSON.parse(text);
      return parsed?.error?.message || parsed?.error || fallback;
    } catch {
      return text.length < 200 ? text : fallback;
    }
  } catch {
    return fallback;
  }
}

/**
 * Streams a Gemini reply. Falls back to the buffered /api/chat endpoint when
 * the server (or a proxy) does not support server-sent events.
 */
export async function streamChat({ message, history = [], signal, onDelta }) {
  let response;

  try {
    response = await fetch(`${BASE}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Can't reach the API server. Is it running on port 5000?", 0);
  }

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/event-stream") || !response.body) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      throw new ApiError("The server sent an unexpected response.", response.status);
    }
    if (payload?.error) {
      throw new ApiError(payload.error?.message || payload.error, response.status);
    }
    const text = payload?.reply || payload?.text || "";
    if (text) onDelta(text);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const consume = (block) => {
    const parsed = parseSseBlock(block);
    if (!parsed) return false;

    if (parsed.data === "[DONE]") return true;

    let payload;
    try {
      payload = JSON.parse(parsed.data);
    } catch {
      return false;
    }

    if (parsed.event === "error" || payload?.error) {
      throw new ApiError(payload.error?.message || payload.error || "The model stopped unexpectedly.", 500);
    }

    if (payload?.text) onDelta(payload.text);
    return false;
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let index;
      while ((index = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        if (consume(block)) return;
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) consume(buffer);
  } finally {
    reader.cancel().catch(() => {});
  }
}

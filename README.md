# Gemini Workspace

A focused, local-first chat workspace powered by the Gemini API. React 19 + Vite on the front,
Express 5 on the back, with streaming answers rendered as proper Markdown.

> Demo project. Not affiliated with Google. Gemini is a trademark of Google.

## What's inside

- **Streaming replies.** The server streams tokens over server-sent events, so answers appear as
  they are written instead of after a long pause. Stop generation at any time.
- **Real conversations.** Multi-turn threads are kept in `localStorage`, listed by day, searchable,
  and deletable with undo. The transcript can be copied as Markdown.
- **Markdown that behaves.** Headings, lists, tables, links and fenced code blocks with language
  labels, syntax highlighting and a copy button. Highlighting is loaded on demand.
- **A theme for the room.** Light, dark and system themes, persisted and applied before first paint.
  A reduce-motion switch mirrors `prefers-reduced-motion`.
- **Works on a phone.** The sidebar becomes a drawer, the composer sticks to the bottom with
  safe-area padding, and controls stay at 44px.
- **Honest diagnostics.** The UI reads `/api/health`; if the key or server is missing, it says so and
  explains the fix instead of failing on the first message.
- **Keyboard first.** `⌘/Ctrl + K` new chat, `⌘/Ctrl + B` toggle sidebar, `/` focus the composer,
  `Esc` stop generating.

## Quick start

```bash
npm install

# 1. add your key
#    PowerShell
Copy-Item .env.example .env
#    macOS / Linux
cp .env.example .env
# then edit .env and set GEMINI_API_KEY

# 2a. run API + client together
npm run dev:all

# 2b. …or in two terminals
npm run server   # http://localhost:5000
npm run dev      # http://localhost:5173
```

Open <http://localhost:5173>. The Vite dev server proxies `/api` to port 5000, so there are no CORS
or hard-coded host issues.

Get a key at <https://aistudio.google.com/apikey>.

## Scripts

| Script              | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev:all`   | API and Vite dev server together                            |
| `npm run dev`       | Vite client only (proxies `/api` to `:5000`)                |
| `npm run server`    | Express API only                                            |
| `npm run build`     | Production client bundle into `dist/`                       |
| `npm start`         | Serve the API and the built client from `dist/`             |
| `npm run preview`   | Preview the built client                                    |
| `npm run lint`      | Oxlint                                                      |

## Configuration

`.env` (project root):

```ini
GEMINI_API_KEY=your_key_here
# optional: comma-separated model order (first healthy model is reused)
# GEMINI_MODELS=gemini-3.5-flash-lite,gemini-3.5-flash,gemini-3.6-flash,gemini-3.8-flash
# optional: how long one model may take to send its first token
# GEMINI_FIRST_TOKEN_TIMEOUT_MS=45000
# optional: timeout for the buffered /api/chat endpoint
# GEMINI_COMPLETE_TIMEOUT_MS=60000
# optional: API port (the dev proxy expects 5000)
# PORT=5000
```

`GEMINI_MODELS` overrides the model chain. The server tries each model in order, retries once on
rate limits or 503s, and gives each model 45s to produce a first token before falling through. The
last model that answered quickly is tried first on the next request, so a congested model doesn't
slow every reply. If a model returns 404 it is retired for that key — bump the list in `.env`.

## API

| Route              | Method | Purpose                                                           |
| ------------------ | ------ | ----------------------------------------------------------------- |
| `/api/health`      | GET    | `{ ok, configured, models, activeModel, uptime }` — drives setup UI |
| `/api/chat/stream` | POST   | SSE stream of `data: {"text": "…"}` chunks, terminated by `[DONE]`  |
| `/api/chat`        | POST   | Buffered `{ reply, model }` fallback                                |

Both chat routes accept `{ message, history }`, where `history` is a list of
`{ role: "user" | "model", content }` turns. Text is capped at 8,000 characters per message and the
last 24 turns are sent.

## Project structure

```
src/
  App.jsx                  state, streaming, persistence, shortcuts
  components/
    Sidebar/               conversation rail, recents, themes
    Main/                  thread, empty state, composer, messages
    Markdown.jsx           markdown + lazily loaded syntax highlighting
    dialogs/               settings and shortcut sheets
    ui/                    native <dialog> shell, toast
    Icons.jsx              inline SVG icon set (theme-aware)
  lib/
    api.js                 SSE client with buffered fallback
    storage.js             chat persistence + preferences
    format.js              day grouping, history mapping
  server/server.js         Express API, streaming, model fallback
  index.css                design tokens and the whole component system
```

## Notes

- Conversations never leave the browser. Clearing site data removes them.
- Demo data and screenshots are fictional; no personal data is stored server-side.
- The client is a single-page app served by Vite in development and by Express in production.

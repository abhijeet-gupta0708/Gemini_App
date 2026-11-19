const CHATS_KEY = "gemini.chats.v1";
const THEME_KEY = "gemini.theme";
const MOTION_KEY = "gemini.reduce-motion";
const SIDEBAR_KEY = "gemini.sidebar";

export const MAX_CHATS = 60;
const MAX_STORED_CHATS = 40;

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ---------------------------------------------------------
   Chats
--------------------------------------------------------- */

function normalizeMessage(message) {
  if (!message || typeof message !== "object") return null;
  if (message.role !== "user" && message.role !== "assistant") return null;
  if (typeof message.content !== "string" || message.content.trim() === "") return null;

  return {
    id: typeof message.id === "string" ? message.id : uid(),
    role: message.role,
    content: message.content,
    createdAt: Number(message.createdAt) || Date.now(),
    stopped: message.stopped === true,
  };
}

function normalizeChat(chat) {
  if (!chat || typeof chat !== "object" || typeof chat.id !== "string") return null;

  const messages = Array.isArray(chat.messages)
    ? chat.messages.map(normalizeMessage).filter(Boolean)
    : [];

  if (messages.length === 0) return null;

  return {
    id: chat.id,
    title:
      typeof chat.title === "string" && chat.title.trim()
        ? chat.title.trim().slice(0, 90)
        : chatTitle(messages.find((m) => m.role === "user")?.content || "Untitled chat"),
    createdAt: Number(chat.createdAt) || messages[0].createdAt,
    updatedAt: Number(chat.updatedAt) || messages[messages.length - 1].createdAt,
    messages,
  };
}

export function loadChats() {
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return { chats: [], activeId: null };

    const parsed = JSON.parse(raw);
    const chats = Array.isArray(parsed?.chats)
      ? parsed.chats
          .map(normalizeChat)
          .filter(Boolean)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, MAX_CHATS)
      : [];

    const activeId = chats.some((chat) => chat.id === parsed?.activeId) ? parsed.activeId : null;
    return { chats, activeId };
  } catch {
    return { chats: [], activeId: null };
  }
}

export function saveChats({ chats, activeId }) {
  const payload = {
    activeId,
    chats: chats.slice(0, MAX_STORED_CHATS).map((chat) => ({
      ...chat,
      messages: chat.messages.map(({ id, role, content, createdAt, stopped }) => ({
        id,
        role,
        content,
        createdAt,
        ...(stopped ? { stopped } : {}),
      })),
    })),
  };

  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(payload));
  } catch {
    try {
      localStorage.setItem(
        CHATS_KEY,
        JSON.stringify({ activeId, chats: payload.chats.slice(0, 10) })
      );
    } catch {
      /* storage unavailable — the app still works for this session */
    }
  }
}

export function chatTitle(text) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "New chat";
  return clean.length > 68 ? `${clean.slice(0, 68).trimEnd()}…` : clean;
}

/* ---------------------------------------------------------
   Preferences
--------------------------------------------------------- */

export function getStoredTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme) {
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  const root = document.documentElement;

  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#0a0a0d" : "#faf9f7");
}

export function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function getStoredMotion() {
  try {
    return localStorage.getItem(MOTION_KEY) === "true";
  } catch {
    return false;
  }
}

export function applyReduceMotion(reduced) {
  if (reduced) {
    document.documentElement.dataset.reduceMotion = "true";
  } else {
    delete document.documentElement.dataset.reduceMotion;
  }
}

export function storeReduceMotion(reduced) {
  try {
    localStorage.setItem(MOTION_KEY, reduced ? "true" : "false");
  } catch {
    /* ignore */
  }
}

export function getStoredSidebarCollapsed() {
  try {
    const value = localStorage.getItem(SIDEBAR_KEY);
    if (value === null) return false;
    return value === "true";
  } catch {
    return false;
  }
}

export function storeSidebarCollapsed(collapsed) {
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? "true" : "false");
  } catch {
    /* ignore */
  }
}

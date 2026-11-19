import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";
import SettingsDialog from "./components/dialogs/SettingsDialog";
import ShortcutsDialog from "./components/dialogs/ShortcutsDialog";
import Toast from "./components/ui/Toast";
import { getHealth, streamChat } from "./lib/api";
import { copyText } from "./lib/clipboard";
import { toHistory } from "./lib/format";
import {
  MAX_CHATS,
  applyReduceMotion,
  applyTheme,
  chatTitle,
  getStoredMotion,
  getStoredSidebarCollapsed,
  getStoredTheme,
  loadChats,
  saveChats,
  storeReduceMotion,
  storeSidebarCollapsed,
  storeTheme,
  uid,
} from "./lib/storage";
import { useMediaQuery } from "./lib/useMediaQuery";

const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
const MOD = IS_MAC ? "⌘" : "Ctrl";

function isEditable(target) {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function shorten(text, max = 42) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export default function App() {
  const [store, setStore] = useState(loadChats);
  const [theme, setTheme] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light"
  );
  const [reduceMotion, setReduceMotion] = useState(getStoredMotion);
  const [collapsed, setCollapsed] = useState(getStoredSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [busyChatId, setBusyChatId] = useState(null);
  const [health, setHealth] = useState(undefined);
  const [toast, setToast] = useState(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const abortRef = useRef(null);
  const busyRef = useRef(null);
  const toastTimer = useRef(null);
  const storeRef = useRef(store);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  const activeChat = store.chats.find((chat) => chat.id === store.activeId) || null;
  const busy = busyChatId !== null;

  /* ---------------------------------------------------------
     Persistence + preferences
  --------------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => saveChats(store), 400);
    return () => clearTimeout(timer);
  }, [store]);

  useEffect(() => {
    const flush = () => saveChats(storeRef.current);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
    storeTheme(theme);
    setResolvedTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");

    if (theme !== "system" || !window.matchMedia) return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      setResolvedTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    applyReduceMotion(reduceMotion);
    storeReduceMotion(reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    storeSidebarCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    document.title = activeChat ? `${activeChat.title} — Gemini` : "Gemini — AI chat workspace";
  }, [activeChat]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---------------------------------------------------------
     Health
  --------------------------------------------------------- */

  const refreshHealth = useCallback(async () => {
    setHealth(undefined);
    const result = await getHealth();
    setHealth(result);
  }, []);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  /* ---------------------------------------------------------
     Toasts
  --------------------------------------------------------- */

  const showToast = useCallback((message, action = null) => {
    clearTimeout(toastTimer.current);
    setToast({ id: uid(), message, action, open: true });
    toastTimer.current = setTimeout(
      () => setToast((prev) => (prev ? { ...prev, open: false } : null)),
      action ? 6500 : 3800
    );
  }, []);

  const handleToastAction = useCallback((action) => {
    clearTimeout(toastTimer.current);
    action.onClick?.();
    setToast((prev) => (prev ? { ...prev, open: false } : null));
  }, []);

  /* ---------------------------------------------------------
     Streaming
  --------------------------------------------------------- */

  const run = useCallback(async (chatId, message, history, replyId) => {
    busyRef.current = chatId;
    setBusyChatId(chatId);

    const controller = new AbortController();
    abortRef.current = controller;

    const update = (mutate) => {
      setStore((prev) => ({
        ...prev,
        chats: prev.chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, updatedAt: Date.now(), messages: mutate(chat.messages) }
            : chat
        ),
      }));
    };

    try {
      await streamChat({
        message,
        history,
        signal: controller.signal,
        onDelta: (delta) => {
          update((messages) =>
            messages.map((item) =>
              item.id === replyId ? { ...item, content: item.content + delta } : item
            )
          );
        },
      });

      update((messages) =>
        messages.map((item) => (item.id === replyId ? { ...item, streaming: false } : item))
      );
    } catch (error) {
      if (error?.name === "AbortError") {
        update((messages) => {
          const target = messages.find((item) => item.id === replyId);
          if (target && !target.content) {
            return messages.filter((item) => item.id !== replyId);
          }
          return messages.map((item) =>
            item.id === replyId ? { ...item, streaming: false, stopped: true } : item
          );
        });
      } else {
        update((messages) =>
          messages.map((item) =>
            item.id === replyId
              ? {
                  ...item,
                  streaming: false,
                  error: error?.message || "Something went wrong. Please try again.",
                }
              : item
          )
        );
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        busyRef.current = null;
        setBusyChatId(null);
      }
    }
  }, []);

  const send = useCallback(
    (text) => {
      if (!text || busyRef.current) return;

      const now = Date.now();
      const replyId = uid();
      const current = storeRef.current;
      const active = current.chats.find((chat) => chat.id === current.activeId);

      // Continue the open conversation so the model keeps its context.
      if (active) {
        const history = toHistory(active.messages);
        const userMessage = { id: uid(), role: "user", content: text, createdAt: now };

        setStore((prev) => ({
          ...prev,
          chats: prev.chats.map((chat) =>
            chat.id === active.id
              ? {
                  ...chat,
                  updatedAt: now,
                  messages: [
                    ...chat.messages,
                    userMessage,
                    { id: replyId, role: "assistant", content: "", createdAt: now, streaming: true },
                  ],
                }
              : chat
          ),
        }));
        setMobileOpen(false);
        run(active.id, text, history, replyId);
        return;
      }

      const chatId = uid();

      const chat = {
        id: chatId,
        title: chatTitle(text),
        createdAt: now,
        updatedAt: now,
        messages: [
          { id: uid(), role: "user", content: text, createdAt: now },
          { id: replyId, role: "assistant", content: "", createdAt: now, streaming: true },
        ],
      };

      setStore((prev) => ({
        chats: [chat, ...prev.chats].slice(0, MAX_CHATS),
        activeId: chatId,
      }));
      setMobileOpen(false);
      run(chatId, text, [], replyId);
    },
    [run]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = useCallback(() => {
    if (busyRef.current || !activeChat) return;

    let index = -1;
    for (let i = activeChat.messages.length - 1; i >= 0; i -= 1) {
      if (activeChat.messages[i].role === "user") {
        index = i;
        break;
      }
    }
    if (index === -1) return;

    const userMessage = activeChat.messages[index];
    const kept = activeChat.messages.slice(0, index + 1);
    const history = toHistory(kept.slice(0, -1));
    const replyId = uid();

    setStore((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              updatedAt: Date.now(),
              messages: [
                ...kept,
                { id: replyId, role: "assistant", content: "", createdAt: Date.now(), streaming: true },
              ],
            }
          : chat
      ),
    }));

    run(activeChat.id, userMessage.content, history, replyId);
  }, [activeChat, run]);

  /* ---------------------------------------------------------
     Chat management
  --------------------------------------------------------- */

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setStore((prev) => ({ ...prev, activeId: null }));
    setMobileOpen(false);
  }, []);

  const selectChat = useCallback((id) => {
    if (busyRef.current && busyRef.current !== id) abortRef.current?.abort();
    setStore((prev) => ({ ...prev, activeId: id }));
    setMobileOpen(false);
  }, []);

  const deleteChat = useCallback(
    (id) => {
      const chat = storeRef.current.chats.find((item) => item.id === id);
      if (!chat) return;

      if (busyRef.current === id) abortRef.current?.abort();
      const index = storeRef.current.chats.findIndex((item) => item.id === id);
      const wasActive = storeRef.current.activeId === id;

      setStore((prev) => ({
        chats: prev.chats.filter((item) => item.id !== id),
        activeId: prev.activeId === id ? null : prev.activeId,
      }));

      showToast(`Deleted “${shorten(chat.title)}”`, {
        label: "Undo",
        onClick: () => {
          setStore((prev) => {
            const chats = [...prev.chats];
            chats.splice(Math.min(index, chats.length), 0, chat);
            return { chats, activeId: wasActive ? id : prev.activeId };
          });
        },
      });
    },
    [showToast]
  );

  const clearAll = useCallback(() => {
    const snapshot = storeRef.current.chats;
    if (snapshot.length === 0) return;

    abortRef.current?.abort();
    setStore({ chats: [], activeId: null });

    showToast(`Cleared ${snapshot.length} conversation${snapshot.length === 1 ? "" : "s"}`, {
      label: "Undo",
      onClick: () => setStore((prev) => ({ ...prev, chats: snapshot })),
    });
  }, [showToast]);

  const copyConversation = useCallback(async () => {
    if (!activeChat) return;

    const transcript = activeChat.messages
      .filter((message) => message.content)
      .map(
        (message) =>
          `${message.role === "user" ? "**You**" : "**Gemini**"}\n\n${message.content}`
      )
      .join("\n\n---\n\n");

    const ok = await copyText(`# ${activeChat.title}\n\n${transcript}`);
    showToast(ok ? "Conversation copied as Markdown" : "Couldn’t copy — clipboard is blocked");
  }, [activeChat, showToast]);

  /* ---------------------------------------------------------
     Keyboard shortcuts
  --------------------------------------------------------- */

  useEffect(() => {
    const onKeyDown = (event) => {
      if (document.querySelector("dialog[open]")) return;

      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (mod && key === "k") {
        event.preventDefault();
        newChat();
      } else if (mod && key === "b") {
        event.preventDefault();
        setCollapsed((value) => !value);
      } else if (mod && event.key === "/") {
        event.preventDefault();
        setShortcutsOpen(true);
      } else if (event.key === "Escape") {
        if (mobileOpen) setMobileOpen(false);
        else if (busyRef.current) stop();
      } else if (event.key === "/" && !isEditable(event.target)) {
        event.preventDefault();
        window.dispatchEvent(new Event("gemini:focus-composer"));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, newChat, stop]);

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */

  return (
    <div className="app">
      <div
        className="scrim"
        data-open={!isDesktop && mobileOpen}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        chats={store.chats}
        activeId={store.activeId}
        onSelect={selectChat}
        onNewChat={newChat}
        onDeleteChat={deleteChat}
        collapsed={isDesktop ? collapsed : false}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        onOpenSettings={() => {
          setMobileOpen(false);
          setSettingsOpen(true);
        }}
        onOpenShortcuts={() => {
          setMobileOpen(false);
          setShortcutsOpen(true);
        }}
        mod={MOD}
      />

      <Main
        chat={activeChat}
        busy={busy}
        health={health}
        onSend={send}
        onStop={stop}
        onRegenerate={regenerate}
        onCopyChat={copyConversation}
        onNewChat={newChat}
        onOpenSidebar={() => setMobileOpen(true)}
        resolvedTheme={resolvedTheme}
        onToggleTheme={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        onRefreshHealth={refreshHealth}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        reduceMotion={reduceMotion}
        onToggleMotion={() => setReduceMotion((value) => !value)}
        health={health}
        onRefreshHealth={refreshHealth}
        chatCount={store.chats.length}
        onClearAll={clearAll}
      />

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        mod={MOD}
      />

      <Toast toast={toast} onAction={handleToastAction} />
    </div>
  );
}

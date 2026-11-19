import { useEffect, useRef, useState } from "react";
import Composer from "./Composer";
import EmptyState from "./EmptyState";
import Message from "./Message";
import { ArrowDown, Copy, Menu, Moon, Plus, Sun } from "../Icons";

export default function Main({
  chat,
  busy,
  health,
  onSend,
  onStop,
  onRegenerate,
  onCopyChat,
  onNewChat,
  onOpenSidebar,
  resolvedTheme,
  onToggleTheme,
  onRefreshHealth,
}) {
  const [draft, setDraft] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const threadRef = useRef(null);
  const stickRef = useRef(true);

  const messages = chat ? chat.messages : [];
  const chatId = chat ? chat.id : null;
  const streamingId = messages.find(
    (message) => message.role === "assistant" && message.streaming
  )?.id;
  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  useEffect(() => {
    setDraft("");
    const el = threadRef.current;
    const hasChat = Boolean(chatId);
    // The welcome screen is taller than the thread on phones and in landscape.
    // Scrolling it to the bottom would hide the greeting, so only chats jump down.
    if (el) el.scrollTop = hasChat ? el.scrollHeight : 0;
    stickRef.current = hasChat;
    setShowJump(false);
    setScrolled(false);
  }, [chatId]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  // The health check resolves after first paint and inserts (or removes) the
  // setup notice, growing the welcome screen. Return it to the greeting
  // instead of leaving it scrolled part-way down.
  const healthState =
    health === undefined
      ? "pending"
      : health === null
        ? "offline"
        : health.configured === false
          ? "unconfigured"
          : "ready";

  useEffect(() => {
    if (chatId) return;
    const el = threadRef.current;
    if (el) el.scrollTop = 0;
  }, [chatId, healthState]);

  // Markdown, code blocks and images render after the first scroll; keep the
  // newest message in view while the thread is still growing.
  useEffect(() => {
    const el = threadRef.current;
    const content = el?.firstElementChild;
    if (!el || !content || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(() => {
      if (stickRef.current) el.scrollTop = el.scrollHeight;
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const handleScroll = () => {
    const el = threadRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = distance < 120;
    setShowJump(distance > 200);
    setScrolled(el.scrollTop > 6);
  };

  const send = (text) => {
    const value = String(text || "").trim();
    if (!value || busy) return;
    stickRef.current = true;
    setDraft("");
    onSend(value);
  };

  const jumpToLatest = () => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    stickRef.current = true;
    setShowJump(false);
  };

  const ToggleIcon = resolvedTheme === "dark" ? Sun : Moon;

  return (
    <main className="main">
      <header className="topbar" data-scrolled={scrolled}>
        <button
          type="button"
          className="icon-btn mobile-only"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={19} />
        </button>

        <div className="topbar__title">
          <span>{chat ? chat.title : "New chat"}</span>
        </div>

        <div className="topbar__spacer" />

        <div className="topbar__actions">
          {chat && messages.length > 0 ? (
            <button
              type="button"
              className="icon-btn"
              onClick={onCopyChat}
              title="Copy conversation"
              aria-label="Copy conversation as Markdown"
            >
              <Copy size={17} />
            </button>
          ) : null}

          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={onToggleTheme}
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
          >
            <ToggleIcon size={18} />
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={onNewChat}
            title="New chat"
            aria-label="New chat"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      <div
        ref={threadRef}
        className={`thread${chat ? "" : " thread--empty"}`}
        onScroll={handleScroll}
      >
        <div className="thread__inner">
          {chat ? (
            messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                streaming={message.id === streamingId}
                canRegenerate={!busy && message.id === lastAssistantId}
                pinned={message.id === lastAssistantId && !busy}
                onRegenerate={onRegenerate}
              />
            ))
          ) : (
            <EmptyState onPick={send} health={health} onRefreshHealth={onRefreshHealth} />
          )}
        </div>

        <button
          type="button"
          className="jump"
          data-show={showJump}
          onClick={jumpToLatest}
          tabIndex={showJump ? 0 : -1}
        >
          <ArrowDown size={14} />
          Latest
        </button>
      </div>

      <div className="composer-wrap">
        <Composer
          value={draft}
          onChange={setDraft}
          onSubmit={send}
          onStop={onStop}
          busy={busy}
          focusKey={chat ? chat.id : "new"}
          model={health?.activeModel || health?.models?.[0]}
        />
        <p className="composer__hint">
          Gemini can make mistakes. Check important information.
        </p>
      </div>
    </main>
  );
}

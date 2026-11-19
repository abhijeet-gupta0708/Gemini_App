import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Message,
  Moon,
  Monitor,
  PanelClose,
  PanelOpen,
  Plus,
  Search,
  Settings,
  Sparkle,
  Sun,
  Trash,
  X,
} from "../Icons";
import { groupChats } from "../../lib/format";
import { useMediaQuery } from "../../lib/useMediaQuery";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const NEXT_THEME = { light: "dark", dark: "system", system: "light" };

function ChatItem({ chat, active, collapsed, onSelect, onDelete }) {
  return (
    <div className="chat-item" data-active={active}>
      <button
        type="button"
        className="chat-item__main"
        onClick={() => onSelect(chat.id)}
        title={chat.title}
        aria-current={active ? "true" : undefined}
      >
        <Message size={15} />
        <span className="chat-item__title">{chat.title}</span>
      </button>
      {!collapsed ? (
        <button
          type="button"
          className="chat-item__delete"
          onClick={() => onDelete(chat.id)}
          aria-label={`Delete conversation: ${chat.title}`}
          title="Delete conversation"
        >
          <Trash size={14} />
        </button>
      ) : null}
    </div>
  );
}

export default function Sidebar({
  chats,
  activeId,
  onSelect,
  onNewChat,
  onDeleteChat,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  theme,
  onThemeChange,
  onOpenSettings,
  onOpenShortcuts,
  mod,
}) {
  const [query, setQuery] = useState("");
  const [focusPending, setFocusPending] = useState(false);
  const searchRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!collapsed && focusPending) {
      searchRef.current?.focus();
      setFocusPending(false);
    }
  }, [collapsed, focusPending]);

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(normalized) ||
          chat.messages.some((message) => message.content.toLowerCase().includes(normalized))
      )
    : chats;

  const groups = groupChats(filtered);
  const ThemeIcon = THEMES.find((item) => item.value === theme)?.icon || Monitor;
  const themeLabel = THEMES.find((item) => item.value === theme)?.label || "System";

  const openSearch = () => {
    if (collapsed) {
      onToggleCollapse();
      setFocusPending(true);
    } else {
      searchRef.current?.focus();
    }
  };

  return (
    <aside
      className="sidebar"
      data-collapsed={collapsed}
      data-open={mobileOpen}
      aria-label="Conversations"
      inert={!isDesktop && !mobileOpen ? true : undefined}
    >
      <div className="sidebar__head">
        <div className="brand">
          <span className="brand__mark">
            <Sparkle size={23} />
          </span>
          <span className="brand__text">
            <span className="brand__name">Gemini</span>
          </span>
        </div>

        <button
          type="button"
          className="icon-btn sidebar__collapse"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelOpen size={17} /> : <PanelClose size={17} />}
        </button>

        <button
          type="button"
          className="icon-btn sidebar__close"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        >
          <X size={17} />
        </button>
      </div>

      <div className="sidebar__scroll">
        <div className="sidebar__section">
          <button
            type="button"
            className="new-chat"
            onClick={onNewChat}
            title={`New chat (${mod === "Ctrl" ? "Ctrl+" : mod}K)`}
          >
            <span className="new-chat__icon">
              <Plus size={15} />
            </span>
            <span className="label">New chat</span>
            <kbd>{mod}</kbd>
            <kbd>K</kbd>
          </button>

          <div className="sidebar__search">
            <Search size={14} />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
            />
          </div>

          <button
            type="button"
            className="icon-btn sidebar__collapsed-search"
            onClick={openSearch}
            title="Search chats"
            aria-label="Search chats"
          >
            <Search size={18} />
          </button>
        </div>

        {collapsed ? (
          <div className="sidebar__divider" />
        ) : (
          <div className="section-label">
            <span>{normalized ? "Results" : "Recents"}</span>
            {filtered.length > 0 ? <span>{filtered.length}</span> : null}
          </div>
        )}

        {collapsed ? (
          filtered.slice(0, 12).map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              active={chat.id === activeId}
              collapsed
              onSelect={onSelect}
              onDelete={onDeleteChat}
            />
          ))
        ) : filtered.length === 0 ? (
          <p className="sidebar__empty">
            {normalized
              ? `No chats match “${query.trim()}”.`
              : "No conversations yet. Your chats will appear here."}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="section-label section-label--group">
                <span>{group.label}</span>
              </div>
              {group.items.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  active={chat.id === activeId}
                  onSelect={onSelect}
                  onDelete={onDeleteChat}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="sidebar__footer">
        <button
          type="button"
          className="nav-item"
          onClick={onOpenSettings}
          title="Settings"
        >
          <Settings size={17} />
          <span className="label">Settings</span>
        </button>

        <button
          type="button"
          className="nav-item"
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts"
        >
          <Keyboard size={17} />
          <span className="label">Shortcuts</span>
          <kbd className="label">{mod}/</kbd>
        </button>

        <div className="theme-switch" role="group" aria-label="Theme">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              data-selected={theme === value}
              aria-pressed={theme === value}
              onClick={() => onThemeChange(value)}
              title={`${label} theme`}
              aria-label={`${label} theme`}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="icon-btn sidebar__theme-cycle"
          onClick={() => onThemeChange(NEXT_THEME[theme])}
          title={`Theme: ${themeLabel}`}
          aria-label={`Theme: ${themeLabel}. Switch to ${NEXT_THEME[theme]}`}
        >
          <ThemeIcon size={17} />
        </button>
      </div>
    </aside>
  );
}

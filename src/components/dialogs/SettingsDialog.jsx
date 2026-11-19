import { useEffect, useState } from "react";
import Dialog from "../ui/Dialog";
import { Alert, Check, Moon, Monitor, Sun } from "../Icons";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsDialog({
  open,
  onClose,
  theme,
  onThemeChange,
  reduceMotion,
  onToggleMotion,
  health,
  onRefreshHealth,
  chatCount,
  onClearAll,
}) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) setConfirming(false);
  }, [open]);

  const configured = Boolean(health && health.configured);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Settings"
      footer={
        <button type="button" className="btn" onClick={onClose}>
          Done
        </button>
      }
    >
      <section className="setting-group">
        <h3 className="setting-group__title">Appearance</h3>
        <p className="setting-group__desc">System follows your device setting automatically.</p>
        <div className="segmented" role="group" aria-label="Theme">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              data-selected={theme === value}
              aria-pressed={theme === value}
              onClick={() => onThemeChange(value)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="setting-group">
        <div className="setting-row setting-row--tight">
          <div>
            <h3 className="setting-group__title">Reduce motion</h3>
            <p className="setting-group__desc">Turn off entrance, hover and typing animations.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reduceMotion}
            aria-label="Reduce motion"
            className="switch"
            onClick={onToggleMotion}
          />
        </div>
      </section>

      <section className="setting-group">
        <h3 className="setting-group__title">Connection</h3>
        {health === undefined ? (
          <p className="setting-group__desc">Checking the API server…</p>
        ) : health === null ? (
          <div className="status-line">
            <span className="eyebrow__dot" data-offline="true" />
            <span>
              Can’t reach the API server. Start it with <code>npm run server</code>.
            </span>
          </div>
        ) : configured ? (
          <div className="status-line">
            <span className="eyebrow__dot" />
            <span>
              Connected. The key is loaded
              {health.models && health.models.length > 0
                ? ` and ${health.models.length} models are queued as fallbacks.`
                : "."}
            </span>
          </div>
        ) : (
          <div className="status-line status-line--start">
            <Alert size={15} />
            <span>
              No <code>GEMINI_API_KEY</code> found. Add it to <code>.env</code> at the project root
              and restart the server.
            </span>
          </div>
        )}
        <div className="setting-actions">
          <button type="button" className="btn btn--ghost" onClick={onRefreshHealth}>
            Check again
          </button>
        </div>
      </section>

      <section className="setting-group">
        <h3 className="setting-group__title">Conversations</h3>
        <p className="setting-group__desc">
          {chatCount > 0
            ? `${chatCount} conversation${chatCount === 1 ? "" : "s"} saved in this browser.`
            : "Nothing saved yet. Conversations stay in this browser only."}
        </p>
        <div className="setting-actions">
          {confirming ? (
            <>
              <span className="setting-note">
                Delete all {chatCount} conversation{chatCount === 1 ? "" : "s"}?
              </span>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  onClearAll();
                  setConfirming(false);
                }}
              >
                Delete all
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() => setConfirming(true)}
              disabled={chatCount === 0}
            >
              Clear all conversations
            </button>
          )}
        </div>
      </section>

      <section className="setting-group">
        <h3 className="setting-group__title">About</h3>
        <div className="status-line">
          <Check size={15} className="status-line__icon" />
          <span>
            Gemini workspace demo · React + Vite front end, Express + Gemini API back end. Not
            affiliated with Google.
          </span>
        </div>
      </section>
    </Dialog>
  );
}

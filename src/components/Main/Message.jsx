import { lazy, Suspense } from "react";
import { Alert, Check, Copy, Refresh, Sparkle } from "../Icons";
import { useCopy } from "../../lib/useCopy";

// Markdown + syntax highlighting is a large chunk; load it with the first reply.
const Markdown = lazy(() => import("../Markdown"));

function Typing() {
  return (
    <span className="typing" role="status" aria-label="Gemini is typing">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function Message({ message, streaming, canRegenerate, onRegenerate, pinned }) {
  const [copied, copy] = useCopy();

  if (message.role === "user") {
    return (
      <div className="msg msg--user">
        <div className="msg__bubble">{message.content}</div>
      </div>
    );
  }

  const hasContent = Boolean(message.content);
  const showActions = !streaming && (hasContent || message.error);

  return (
    <div className="msg msg--assistant">
      <div className="msg__avatar">
        <Sparkle size={15} />
      </div>

      <div className="msg__body">
        <div className="msg__meta">Gemini</div>

        {hasContent ? (
          <Suspense
            fallback={
              <div className="markdown">
                <p>{message.content}</p>
              </div>
            }
          >
            <Markdown content={message.content} />
          </Suspense>
        ) : null}

        {streaming ? (
          <div className="msg__typing">
            <Typing />
          </div>
        ) : null}

        {message.stopped ? <span className="msg__stopped">Stopped early</span> : null}

        {message.error ? (
          <div className="msg__error" role="alert">
            <Alert size={16} />
            <div>
              <strong>That reply didn’t finish</strong>
              <span>{message.error}</span>
              {canRegenerate ? (
                <div className="msg__error-actions">
                  <button type="button" className="btn btn--ghost" onClick={onRegenerate}>
                    <Refresh size={14} />
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {showActions ? (
          <div className="msg__actions" data-pinned={pinned || undefined}>
            {hasContent ? (
              <button
                type="button"
                className="icon-btn icon-btn--sm"
                onClick={() => copy(message.content)}
                aria-label={copied ? "Reply copied" : "Copy reply"}
                title={copied ? "Copied" : "Copy reply"}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            ) : null}

            {canRegenerate ? (
              <button
                type="button"
                className="icon-btn icon-btn--sm"
                onClick={onRegenerate}
                aria-label="Regenerate reply"
                title="Regenerate reply"
              >
                <Refresh size={15} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

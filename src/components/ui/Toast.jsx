export default function Toast({ toast, onAction }) {
  return (
    <div className="toast" data-show={Boolean(toast?.open)} role="status" aria-live="polite">
      <span className="toast__message">{toast?.message}</span>
      {toast?.action ? (
        <button
          type="button"
          className="toast__action"
          onClick={() => onAction(toast.action)}
          tabIndex={toast.open ? 0 : -1}
        >
          {toast.action.label}
        </button>
      ) : null}
    </div>
  );
}

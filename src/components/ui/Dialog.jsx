import { useEffect, useId, useRef } from "react";
import { X } from "../Icons";

/**
 * Native <dialog> wrapper: focus trapping, Esc handling and inert background
 * come from the platform instead of custom key listeners.
 */
export default function Dialog({ open, onClose, title, children, footer }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="dialog__panel">
        <div className="dialog__head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>
        <div className="dialog__body">{children}</div>
        {footer ? <div className="dialog__foot">{footer}</div> : null}
      </div>
    </dialog>
  );
}

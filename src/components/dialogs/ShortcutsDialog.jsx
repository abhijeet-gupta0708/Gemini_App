import Dialog from "../ui/Dialog";

function Keys({ keys }) {
  return (
    <dd>
      {keys.map((key) => (
        <kbd key={key}>{key}</kbd>
      ))}
    </dd>
  );
}

export default function ShortcutsDialog({ open, onClose, mod }) {
  const commandKeys = mod === "Ctrl" ? ["Ctrl", "K"] : [mod, "K"];
  const sidebarKeys = mod === "Ctrl" ? ["Ctrl", "B"] : [mod, "B"];
  const helpKeys = mod === "Ctrl" ? ["Ctrl", "/"] : [mod, "/"];

  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts">
      <dl className="shortcuts">
        <dt>New chat</dt>
        <Keys keys={commandKeys} />
        <dt>Focus composer</dt>
        <Keys keys={["/"]} />
        <dt>Toggle sidebar</dt>
        <Keys keys={sidebarKeys} />
        <dt>Open this list</dt>
        <Keys keys={helpKeys} />
        <dt>Send message</dt>
        <Keys keys={["Enter"]} />
        <dt>New line</dt>
        <Keys keys={["Shift", "Enter"]} />
        <dt>Stop generating</dt>
        <Keys keys={["Esc"]} />
        <dt>Close a dialog</dt>
        <Keys keys={["Esc"]} />
      </dl>
    </Dialog>
  );
}

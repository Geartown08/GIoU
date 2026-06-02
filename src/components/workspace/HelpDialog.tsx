import { useEffect, useRef } from 'react';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: { key: string; label: string }[] = [
  { key: 'V', label: 'Select' },
  { key: 'M', label: 'Analyse' },
  { key: 'W', label: 'Move' },
  { key: 'E', label: 'Rotate' },
  { key: 'R', label: 'Scale' },
  { key: 'Q', label: 'Random cuboid' },
  { key: 'D', label: 'Duplicate' },
  { key: 'X', label: 'Delete' },
  { key: 'A', label: 'Add cuboid' },
  { key: 'Esc', label: 'Clear selection or close the current dialog' },
];

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    const handleClose = () => {
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="help-dialog"
      aria-labelledby="help-dialog-title"
    >
      <div className="help-dialog-inner">
        <header className="help-dialog-header">
          <h2 id="help-dialog-title" className="help-dialog-title">
            Welcome to the GIoU Visualiser
          </h2>
          <button
            type="button"
            className="help-dialog-close"
            onClick={onClose}
            aria-label="Close help"
          >
            ×
          </button>
        </header>

        <div className="help-dialog-body">
          <section className="help-section">
            <h3 className="help-section-title">Quick Start</h3>
            <ol className="help-list">
              <li>Add at least two cuboids from the Object panel or use Random (Q).</li>
              <li>Click Analyse or press M.</li>
              <li>Click two cuboids one after another. No Shift or Ctrl key is required.</li>
              <li>Read the live IoU and GIoU metrics in the Analyse popup.</li>
              <li>Open the Explain tab to view the full derivation.</li>
              <li>Switch to Move, Rotate, or Scale to edit cuboids while metrics update live.</li>
            </ol>
          </section>

          <section className="help-section">
            <h3 className="help-section-title">3D Controls</h3>
            <ul className="help-list">
              <li>Drag to orbit the camera.</li>
              <li>Use the view cube to change direction.</li>
              <li>Select Move, Rotate, or Scale before editing a cuboid.</li>
            </ul>
          </section>

          <section className="help-section">
            <h3 className="help-section-title">Keyboard Shortcuts</h3>
            <ul className="help-shortcuts">
              {SHORTCUTS.map(({ key, label }) => (
                <li key={key} className="help-shortcut-row">
                  <kbd className="help-shortcut-key">{key}</kbd>
                  <span className="help-shortcut-label">{label}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </dialog>
  );
}

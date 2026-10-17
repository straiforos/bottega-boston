import { useEffect, useRef, type ReactNode } from 'react';

interface GalleryEditorDialogProps {
  open: boolean;
  label: string;
  onCancel: () => void;
  children: ReactNode;
}

/** Keeps the full editor outside the fixed-height gallery track. */
export function GalleryEditorDialog({ open, label, onCancel, children }: GalleryEditorDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="gallery-editor-dialog"
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        // Saving disables the editor's cancel action; keep Escape consistent.
        if (!ref.current?.querySelector('button[type="submit"]:disabled')) onCancel();
      }}
    >
      {open && children}
    </dialog>
  );
}
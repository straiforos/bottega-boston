import { forwardRef, useEffect, useId, useImperativeHandle, useRef, type DialogHTMLAttributes, type ReactNode } from "react";
import { Button } from "./Button";
import { cx } from "../lib/cx";

export interface ConfirmationProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "title" | "onConfirm" | "onCancel"> {
  open: boolean;
  title: string;
  children?: ReactNode;
  variant?: "default" | "danger";
  size?: "sm" | "md";
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Controlled modal confirmation. Native dialog handles focus containment, background inertness and focus restoration. */
export const Confirmation = forwardRef<HTMLDialogElement, ConfirmationProps>(function Confirmation(
  { open, title, children, variant = "default", size = "md", confirmLabel = "Confirm", cancelLabel = "Cancel",
    pending = false, onConfirm, onCancel, className, ...props }, ref,
) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();
  useImperativeHandle(ref, () => {
    if (!dialog.current) throw new Error("Confirmation dialog has not mounted");
    return dialog.current;
  });
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);
  return (
    <dialog {...props} ref={dialog} className={cx("bt-confirmation", `bt-confirmation--${variant}`, `bt-confirmation--${size}`, className)}
      aria-labelledby={titleId} aria-describedby={children ? bodyId : undefined} aria-busy={pending || undefined}
      onCancel={(event) => { event.preventDefault(); if (!pending) onCancel(); }}>
      <span className="bt-confirmation__icon" aria-hidden="true">{variant === "danger" ? "!" : "✓"}</span>
      <h2 className="bt-confirmation__title" id={titleId}>{title}</h2>
      {children && <div className="bt-confirmation__body" id={bodyId}>{children}</div>}
      <div className="bt-confirmation__actions">
        <Button variant="ghost" autoFocus disabled={pending} onClick={onCancel}>{cancelLabel}</Button>
        <Button className="bt-confirmation__confirm" disabled={pending} onClick={onConfirm}>{pending ? "Please wait…" : confirmLabel}</Button>
      </div>
    </dialog>
  );
});

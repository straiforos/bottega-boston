import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { createTimer, pushSnackbar, resolveDuration } from "../lib/snackbar-queue";

export type SnackbarVariant = "default" | "success" | "info" | "danger";

export interface SnackbarAction { label: string; onClick: () => void }

export interface SnackbarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Message text or content. */
  children: ReactNode;
  variant?: SnackbarVariant;
  /** One optional action, e.g. Undo. Clicking it also dismisses. */
  action?: SnackbarAction;
  /** Shows a close button when provided. */
  onDismiss?: () => void;
  dismissLabel?: string;
}

/** A single Bottega message bar. Usually rendered through SnackbarProvider. */
export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(function Snackbar(
  { children, variant = "default", action, onDismiss, dismissLabel = "Dismiss message", className, onKeyDown, ...props }, ref,
) {
  return (
    <div ref={ref} role={variant === "danger" ? "alert" : "status"} aria-live={variant === "danger" ? "assertive" : "polite"}
      className={cx("bt-snackbar", `bt-snackbar--${variant}`, className)}
      onKeyDown={(e) => { onKeyDown?.(e); if (e.key === "Escape" && onDismiss) onDismiss(); }} {...props}>
      <div className="bt-snackbar__message">{children}</div>
      {action && (
        <button type="button" className="bt-snackbar__action" onClick={() => { action.onClick(); onDismiss?.(); }}>{action.label}</button>
      )}
      {onDismiss && (
        <button type="button" className="bt-snackbar__close" aria-label={dismissLabel} onClick={onDismiss}>
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
});

export interface SnackbarOptions {
  message: ReactNode;
  variant?: SnackbarVariant;
  action?: SnackbarAction;
  /** Milliseconds before auto-close. Default 5000; null keeps it open. */
  duration?: number | null;
}

interface SnackbarItem extends SnackbarOptions { id: string }

export interface SnackbarContextValue {
  show: (options: SnackbarOptions) => string;
  dismiss: (id: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export interface SnackbarProviderProps { children?: ReactNode; max?: number }

/** Wrap the app once; call useSnackbar().show(...) anywhere inside. */
export function SnackbarProvider({ children, max }: SnackbarProviderProps) {
  const [items, setItems] = useState<SnackbarItem[]>([]);
  const counter = useRef(0);
  const dismiss = useCallback((id: string) => setItems((list) => list.filter((s) => s.id !== id)), []);
  const show = useCallback((options: SnackbarOptions) => {
    const id = `bt-snackbar-${++counter.current}`;
    setItems((list) => pushSnackbar(list, { ...options, id }, max));
    return id;
  }, [max]);
  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <div className="bt-snackbar-region" aria-label="Notifications">
        {items.map((item) => <TimedSnackbar key={item.id} item={item} onDismiss={() => dismiss(item.id)} />)}
      </div>
    </SnackbarContext.Provider>
  );
}

function TimedSnackbar({ item, onDismiss }: { item: SnackbarItem; onDismiss: () => void }) {
  const timer = useRef<ReturnType<typeof createTimer> | null>(null);
  const done = useRef(onDismiss);
  done.current = onDismiss;
  useEffect(() => {
    const ms = resolveDuration(item.duration);
    if (ms === null) return;
    timer.current = createTimer(ms, () => done.current());
    return () => timer.current?.clear();
  }, [item.duration]);
  const pause = () => timer.current?.pause();
  const resume = () => timer.current?.resume();
  return (
    <Snackbar variant={item.variant} action={item.action} onDismiss={onDismiss}
      onMouseEnter={pause} onMouseLeave={resume} onFocus={pause}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) resume(); }}>
      {item.message}
    </Snackbar>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used inside <SnackbarProvider>");
  return ctx;
}

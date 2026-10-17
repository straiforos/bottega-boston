import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { Button } from "./Button";
import { MenuOverlay } from "./MenuOverlay";

export interface MenuSubmenuProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Visible disclosure label, not a navigation destination. */
  label: string;
  children: ReactNode;
  /** Controlled disclosure state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/** Click-to-open desktop dropdown and compact inline disclosure, sharing MenuOverlay's panel and tokens. */
export const MenuSubmenu = forwardRef<HTMLDivElement, MenuSubmenuProps>(function MenuSubmenu(
  { label, children, open, defaultOpen = false, onOpenChange, disabled = false, className,
    onKeyDown, onBlur, onClick, ...props }, ref,
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const expanded = !disabled && (open ?? internalOpen);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const panelId = `bt-submenu-${useId().replace(/:/g, "")}`;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!expanded) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        if (open === undefined) setInternalOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [expanded, open, onOpenChange]);

  return (
    <div {...props} ref={(node) => {
      root.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }} className={cx("bt-menu-submenu", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape" && expanded) {
          event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus();
        } else if (event.key === "ArrowDown" && event.target === trigger.current) {
          event.preventDefault(); setOpen(true);
          requestAnimationFrame(() => root.current?.querySelector<HTMLElement>(".bt-menu-overlay--submenu a[href], .bt-menu-overlay--submenu button:not(:disabled)")?.focus());
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.defaultPrevented && expanded && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && event.target instanceof Element && event.target.closest("a[href]")) setOpen(false);
      }}>
      <Button ref={trigger} variant="ghost" size="sm" className="bt-menu-submenu__trigger" disabled={disabled}
        aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(!expanded)}>
        <span>{label}</span><span className="bt-menu-submenu__chevron" aria-hidden="true">⌄</span>
      </Button>
      <MenuOverlay id={panelId} variant="submenu" open={expanded} label={label}>{children}</MenuOverlay>
    </div>
  );
});
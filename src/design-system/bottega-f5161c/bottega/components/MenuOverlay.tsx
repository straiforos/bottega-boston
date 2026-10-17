import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";

export interface MenuOverlayProps extends HTMLAttributes<HTMLElement> {
  /** Controls whether the compact navigation panel is visible. */
  open?: boolean;
  /** Optional actions displayed after the navigation links. */
  footer?: ReactNode;
  /** Accessible name for the navigation landmark. */
  label?: string;
  /** Primary navigation or a child disclosure panel (no nested navigation landmark). */
  variant?: "primary" | "submenu";
}

/**
 * Responsive navigation that displays inline on wide screens and as a framed overlay on compact screens.
 *
 * @example
 * <MenuOverlay open={menuOpen} label="Primary" footer={<Button size="sm">Order now</Button>}>
 *   <a className="bt-menu-overlay__link" href="/menu">Menu</a>
 * </MenuOverlay>
 *
 * Do not place unrelated page content inside the overlay.
 */
export const MenuOverlay = forwardRef<HTMLElement, MenuOverlayProps>(function MenuOverlay(
  { open = false, footer, label = "Primary", variant = "primary", className, children, ...props },
  ref,
) {
  const Element = variant === "submenu" ? "div" : "nav";
  return (
    <Element
      ref={(node) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cx("bt-menu-overlay", `bt-menu-overlay--${variant}`, open && "bt-menu-overlay--open", className)}
      role={variant === "submenu" ? "group" : undefined}
      hidden={variant === "submenu" && !open}
      aria-label={label}
      {...props}
    >
      <div className="bt-menu-overlay__links">{children}</div>
      {footer ? <div className="bt-menu-overlay__footer">{footer}</div> : null}
    </Element>
  );
});

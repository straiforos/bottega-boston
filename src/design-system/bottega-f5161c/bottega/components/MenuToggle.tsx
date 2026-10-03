import { forwardRef, type ButtonHTMLAttributes } from "react";
import noodleMenu from "../assets/icons/noodle-menu.png";
import { cx } from "../lib/cx";

export interface MenuToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Whether the menu controlled by this button is currently open. */
  open?: boolean;
  /** Scale of the menu control. */
  size?: "sm" | "md";
  /** Accessible and visible label used in the closed state. */
  openLabel?: string;
  /** Accessible and visible label used in the open state. */
  closeLabel?: string;
}

/**
 * Bottega's noodle-icon menu trigger for compact navigation.
 *
 * @example
 * <MenuToggle open={menuOpen} aria-controls="site-navigation" onClick={toggleMenu} />
 *
 * Use this as the trigger for a navigation panel, not as a generic action button.
 */
export const MenuToggle = forwardRef<HTMLButtonElement, MenuToggleProps>(function MenuToggle(
  {
    open = false,
    size = "md",
    openLabel = "Menu",
    closeLabel = "Close",
    className,
    type = "button",
    ...props
  },
  ref,
) {
  const label = open ? closeLabel : openLabel;

  return (
    <button
      ref={ref}
      type={type}
      className={cx("bt-menu-toggle", `bt-menu-toggle--${size}`, className)}
      aria-expanded={open}
      aria-label={label}
      {...props}
    >
      <img className="bt-menu-toggle__icon" src={noodleMenu} alt="" aria-hidden="true" />
      <span className="bt-menu-toggle__label">{label}</span>
    </button>
  );
});

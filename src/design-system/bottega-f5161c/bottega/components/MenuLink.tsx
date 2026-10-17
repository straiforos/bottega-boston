import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cx } from "../lib/cx";
import { externalRel } from "../lib/link-rel";

export interface MenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

/** Navigation destination inside MenuOverlay or MenuSubmenu. Use aria-current="page" for the current destination. */
export const MenuLink = forwardRef<HTMLAnchorElement, MenuLinkProps>(function MenuLink(
  { className, target, rel, ...props }, ref,
) {
  return <a ref={ref} className={cx("bt-menu-overlay__link", className)} target={target} rel={externalRel(target, rel)} {...props} />;
});
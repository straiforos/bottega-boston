import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";

export interface SiteHeaderProps extends HTMLAttributes<HTMLElement> {
  logo: ReactNode;
  action?: ReactNode;
  variant?: "cream" | "forest";
}

/** Minimal top bar: logo left, single call-to-action right. */
export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader(
  { logo, action, variant = "cream", className, ...props },
  ref,
) {
  return (
    <header ref={ref} className={cx("bt-header", `bt-header--${variant}`, className)} {...props}>
      <div>{logo}</div>
      {action}
    </header>
  );
});

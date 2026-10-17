import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cx } from "../lib/cx";
import { externalRel } from "../lib/link-rel";

export interface LinkActionProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  tone?: "forest" | "cream" | "mustard";
}

/** Secondary action: underlined condensed caps with a sliding arrow. */
export const LinkAction = forwardRef<HTMLAnchorElement, LinkActionProps>(function LinkAction(
  { tone = "forest", className, children, target, rel, ...props },
  ref,
) {
  return (
    <a ref={ref} className={cx("bt-link-action", `bt-link-action--${tone}`, className)} target={target} rel={externalRel(target, rel)} {...props}>
      {children}
      <span className="bt-link-action__arrow" aria-hidden="true">→</span>
    </a>
  );
});

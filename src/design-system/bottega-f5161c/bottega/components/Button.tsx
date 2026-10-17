import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type Ref } from "react";
import { cx } from "../lib/cx";
import { externalRel } from "../lib/link-rel";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>,
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> {
  /** Visual style. `primary` = forest pill with mustard text (Order Now). `cream` = for forest backgrounds. */
  variant?: "primary" | "accent" | "outline" | "ghost" | "cream";
  size?: "sm" | "md" | "lg";
  /** `full` stretches to the container (form submit buttons). */
  width?: "auto" | "full";
  /** Renders as a semantic `<a>` instead of a `<button>`; use for external actions such as ChowNow ordering. */
  href?: string;
}

/** Pill-shaped action button. Pass `href` to render as a link (external actions like ChowNow ordering). */
export const Button = forwardRef<HTMLAnchorElement | HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", width = "auto", href, target, rel, className, type = "button", ...props },
  ref,
) {
  const classes = cx("bt-button", `bt-button--${variant}`, `bt-button--${size}`, width === "full" && "bt-button--full", className);
  if (href !== undefined) {
    // Shared handlers (onClick, className, etc.) are structurally identical across button/anchor events.
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={externalRel(target, rel)}
        className={classes}
        {...anchorProps}
      />
    );
  }
  return (
    <button ref={ref as Ref<HTMLButtonElement>} type={type} className={classes} {...props} />
  );
});

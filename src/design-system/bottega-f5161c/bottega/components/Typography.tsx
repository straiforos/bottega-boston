import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../lib/cx";

export type Tone = "forest" | "cream" | "mustard" | "terracotta" | "tomato" | "cobalt" | "ink" | "inherit";

export interface DisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "p";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  tone?: Tone;
}

/** Condensed all-caps headline (Barlow Condensed). For big shouty statements. */
export const Display = forwardRef<HTMLHeadingElement, DisplayProps>(function Display(
  { as: Tag = "h2", size = "lg", tone = "inherit", className, ...props },
  ref,
) {
  return <Tag ref={ref} className={cx("bt-display", `bt-display--${size}`, `bt-tone--${tone}`, className)} {...props} />;
});

export interface SerifProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: "h2" | "h3" | "h4" | "p" | "span";
  size?: "sm" | "md" | "lg";
  tone?: Tone;
}

/** Elegant serif (Domine) for titles, taglines and marquees. */
export const Serif = forwardRef<HTMLParagraphElement, SerifProps>(function Serif(
  { as: Tag = "p", size = "md", tone = "inherit", className, ...props },
  ref,
) {
  return <Tag ref={ref} className={cx("bt-serif", `bt-serif--${size}`, `bt-tone--${tone}`, className)} {...props} />;
});

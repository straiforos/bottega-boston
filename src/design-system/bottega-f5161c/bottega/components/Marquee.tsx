import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** Repeated word or phrase. */
  text: string;
  /** Optional separator glyph between repeats. */
  separator?: ReactNode;
  variant?: "cream" | "forest" | "tomato";
  repeat?: number;
}

/** Endlessly scrolling banner strip ("BENVENUTI ~ BENVENUTI"). */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(function Marquee(
  { text, separator = "✦", variant = "cream", repeat = 8, className, ...props },
  ref,
) {
  const items = Array.from({ length: repeat * 2 });
  return (
    <div ref={ref} role="marquee" aria-label={text} className={cx("bt-marquee", `bt-marquee--${variant}`, className)} {...props}>
      <div className="bt-marquee__track" aria-hidden="true">
        {items.map((_, i) => (
          <span key={i} className="bt-marquee__item">
            {text}
            <span>{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
});

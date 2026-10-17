import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "cream" | "mustard" | "cobalt" | "forest" | "white";
  shape?: "rect" | "arch";
  elevated?: boolean;
}

/** Poster-like panel with a terracotta hairline border. `arch` gives the rounded-top window shape. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "cream", shape = "rect", elevated = false, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("bt-card", `bt-card--${variant}`, `bt-card--${shape}`, elevated && "bt-card--elevated", className)}
      {...props}
    />
  );
});

export interface ArchFrameProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  /** Optional element pinned at the bottom (e.g. a Button). */
  action?: ReactNode;
}

/** Image cropped into an arched window. */
export const ArchFrame = forwardRef<HTMLDivElement, ArchFrameProps>(function ArchFrame(
  { src, alt, action, className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cx("bt-arch-frame", className)} {...props}>
      <img src={src} alt={alt} />
      {action && <div className="bt-arch-frame__action">{action}</div>}
    </div>
  );
});

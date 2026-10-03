import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../lib/cx";

export interface StampProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  /** `bold` = chunky stamp font; `light` = thin geometric caps. */
  variant?: "bold" | "light";
}

/** Rotated circular badge ("Catering Menu", "Buona Semplice Italiano"). */
export const Stamp = forwardRef<HTMLSpanElement, StampProps>(function Stamp(
  { size = "md", variant = "bold", className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx("bt-stamp", `bt-stamp--${size}`, variant === "light" && "bt-stamp--serif", className)}
      {...props}
    />
  );
});

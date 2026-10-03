import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "../lib/cx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = forest pill with mustard text (Order Now). `cream` = for forest backgrounds. */
  variant?: "primary" | "accent" | "outline" | "ghost" | "cream";
  size?: "sm" | "md" | "lg";
  /** `full` stretches to the container (form submit buttons). */
  width?: "auto" | "full";
}

/** Pill-shaped action button. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", width = "auto", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("bt-button", `bt-button--${variant}`, `bt-button--${size}`, width === "full" && "bt-button--full", className)}
      {...props}
    />
  );
});

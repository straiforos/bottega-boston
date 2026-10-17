import { forwardRef, useId, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  /** `inverse` for forest/cobalt backgrounds (mustard label and border). */
  surface?: "default" | "inverse";
}

/** Labelled input with hint and error text. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, id, surface = "default", className, ...props },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const hintId = `${inputId}-hint`;
  const msg = error ?? hint;
  return (
    <div className={cx("bt-field", surface === "inverse" && "bt-field--inverse", className)}>
      <label className="bt-field__label" htmlFor={inputId}>{label}{props.required && " *"}</label>
      <input
        ref={ref}
        id={inputId}
        className="bt-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={msg ? hintId : undefined}
        {...props}
      />
      {msg && <span id={hintId} className={cx("bt-field__hint", error && "bt-field__hint--error")}>{msg}</span>}
    </div>
  );
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode;
  surface?: "default" | "inverse";
}

/** Checkbox with its label as children. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, surface = "default", className, ...props },
  ref,
) {
  return (
    <label className={cx("bt-checkbox", `bt-checkbox--${surface}`, className)}>
      <input ref={ref} type="checkbox" {...props} />
      <span>{children}</span>
    </label>
  );
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode;
  surface?: "default" | "inverse";
}

/** Radio button with its label as children. Group with a shared `name`. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { children, surface = "default", className, ...props },
  ref,
) {
  return (
    <label className={cx("bt-checkbox", `bt-checkbox--${surface}`, className)}>
      <input ref={ref} type="radio" {...props} />
      <span>{children}</span>
    </label>
  );
});

export interface PillLabelProps extends HTMLAttributes<HTMLSpanElement> {
  /** Solid fills, or `chip-*` = parchment with a fine border (dietary tags). */
  variant?: "forest" | "mustard" | "terracotta" | "tomato" | "cobalt" | "chip-forest" | "chip-terracotta" | "chip-tomato";
}

/** Small uppercase tag ("New", "Vegetarian"). */
export const PillLabel = forwardRef<HTMLSpanElement, PillLabelProps>(function PillLabel(
  { variant = "forest", className, ...props },
  ref,
) {
  return <span ref={ref} className={cx("bt-pill-label", `bt-pill-label--${variant}`, className)} {...props} />;
});

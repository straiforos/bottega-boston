import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../lib/cx";
import bottegaMark from "../assets/logos/bottega-logo.png";
import bottegaWordmark from "../assets/logos/bottega-wordmark.png";

export interface LogoProps extends HTMLAttributes<HTMLElement> {
  /** Which logo treatment to render. */
  variant?: "mark" | "wordmark" | "lockup" | "lockup-wordmark";
  /** Overall scale. */
  size?: "sm" | "md" | "lg";
  /**
   * Ink treatment. "auto" follows the theme (ink on light, cream on dark).
   * "cream" forces the light treatment for use on forest/cobalt surfaces.
   * "ink" forces the dark treatment for use on cream/mustard surfaces.
   */
  tone?: "auto" | "ink" | "cream";
  /**
   * Alt text read by screen readers and used for SEO. The wordmark defaults to
   * the full brand name; the standalone mark defaults to "Bottega". The lockup
   * carries its own visible "Bottega" text, so its mark is decorative.
   */
  alt?: string;
}

/** Bottega brand logo: dome mark, BOTTEGA® wordmark, or mark + name lockup. */
export const Logo = forwardRef<HTMLElement, LogoProps>(function Logo(
  { variant = "mark", size = "md", tone = "auto", alt, className, ...props },
  ref,
) {
  const cls = cx(
    "bt-logo",
    `bt-logo--${variant}`,
    `bt-logo--${size}`,
    `bt-logo--tone-${tone}`,
    className,
  );

  if (variant === "lockup" || variant === "lockup-wordmark") {
    return (
      <span ref={ref as never} className={cls} {...props}>
        <img className="bt-logo__mark" src={bottegaMark} alt="" aria-hidden="true" />
        {variant === "lockup" ? (
          <span className="bt-logo__name">Bottega</span>
        ) : (
          <img className="bt-logo__wordmark" src={bottegaWordmark} alt={alt ?? "Bottega — Cucina & Mercato Italiano"} />
        )}
      </span>
    );
  }

  const src = variant === "mark" ? bottegaMark : bottegaWordmark;
  const resolvedAlt = alt ?? (variant === "mark" ? "Bottega" : "Bottega — Cucina & Mercato Italiano");
  return <img ref={ref as never} className={cls} src={src} alt={resolvedAlt} {...props} />;
});

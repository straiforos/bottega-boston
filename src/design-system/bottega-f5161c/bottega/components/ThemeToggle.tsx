import { forwardRef, useEffect, useState, type ButtonHTMLAttributes } from "react";
import { cx } from "../lib/cx";

export type Theme = "light" | "dark";

export interface ThemeToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Theme used when the visitor has not saved a preference. */
  defaultTheme?: Theme;
  size?: "sm" | "md";
}

/** Icon-only control that switches and remembers the page color theme. */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle(
  { defaultTheme = "dark", size = "md", className, type = "button", onClick, ...props },
  ref,
) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("bt-theme");
    const initialTheme: Theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : defaultTheme;
    document.documentElement.dataset.theme = initialTheme;
    document.documentElement.style.colorScheme = initialTheme;
    setTheme(initialTheme);
  }, [defaultTheme]);

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      ref={ref}
      type={type}
      className={cx("bt-theme-toggle", `bt-theme-toggle--${size}`, className)}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      onClick={(event) => {
        document.documentElement.dataset.theme = nextTheme;
        document.documentElement.style.colorScheme = nextTheme;
        window.localStorage.setItem("bt-theme", nextTheme);
        setTheme(nextTheme);
        onClick?.(event);
      }}
      {...props}
    >
      {theme === "light" ? (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
});
export type MapTheme = "light" | "dark" | "auto";

/** Resolve a map override without changing the site's theme. */
export function resolveMapTheme(theme: MapTheme = "auto", siteTheme?: string): "light" | "dark" {
  return theme === "auto" ? (siteTheme === "dark" ? "dark" : "light") : theme;
}
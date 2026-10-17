/**
 * Email clients cannot read CSS variables, so emails use the literal values of the
 * Bottega light-theme tokens (copied from the design system's theme.css). Deliberate,
 * documented deviation — keep in sync if the library's palette changes.
 */
export const emailTheme = {
  forest: '#165740',
  cream: '#fff9ea',
  parchment: '#f4eedc',
  white: '#ffffff',
  mustard: '#ffd66b',
  terracotta: '#a2481d',
  ink: '#0a0a0a',
  muted: '#414942',
  display: "'Barlow Condensed', 'Arial Narrow', Impact, sans-serif",
  serif: "Domine, Georgia, 'Times New Roman', serif",
  sans: "'DM Sans', Helvetica, Arial, sans-serif",
} as const;

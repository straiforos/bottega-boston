/**
 * Email clients cannot read CSS variables, so emails use the literal values of the
 * Bottega light-theme tokens (copied from the design system's theme.css). Deliberate,
 * documented deviation — keep in sync if the library's palette changes.
 */
export const emailTheme = {
  forest: '#194d33',
  cream: '#faf6ee',
  parchment: '#f1ebdd',
  white: '#ffffff',
  mustard: '#f8d468',
  tomato: '#d63426',
  ink: '#1e1a17',
  muted: '#414942',
  display: "'Barlow Condensed', 'Arial Narrow', Impact, sans-serif",
  serif: "Domine, Georgia, 'Times New Roman', serif",
  sans: "'DM Sans', Helvetica, Arial, sans-serif",
} as const;

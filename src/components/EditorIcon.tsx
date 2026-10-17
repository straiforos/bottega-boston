/** App-owned inline editor action icons: path geometry in the library's 24-unit grid, no width/height or transform attributes. */
const EDITOR_ICON_PATHS = {
  up: 'M12 3.5 20 12h-5v8.5H9V12H4z',
  down: 'M12 20.5 4 12h5V3.5h6V12h5z',
  copy: 'M14 2H6v14h2V4h6zM8 6h10v16H8z',
  trash: 'M9 3h6v2h5v2H4V5h5zM6 9h12l-1.1 12H7.1z',
  plus: 'M10.5 4h3v6.5H20v3h-6.5V20h-3v-6.5H4v-3h6.5z',
} as const;

export type EditorIconKind = keyof typeof EDITOR_ICON_PATHS;

interface EditorIconProps {
  kind: EditorIconKind;
  /** Matches the design system's button sizes; the drawn size comes from its icon token. */
  size?: 'sm' | 'md';
}

/** Solid action glyph that inherits the surrounding text colour, so it stays legible on any themed button. */
export function EditorIcon({ kind, size = 'sm' }: EditorIconProps) {
  return (
    <svg className={`editor-icon editor-icon--${size}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={EDITOR_ICON_PATHS[kind]} />
    </svg>
  );
}

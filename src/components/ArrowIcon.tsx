/** Solid block arrows, drawn as path geometry in the same 24-unit grid the library's own icons use. */
const ARROW_PATHS = {
  left: 'M22 9H11V4l-9 8 9 8v-5h11z',
  right: 'M2 9h11V4l9 8-9 8v-5H2z',
} as const;

interface ArrowIconProps {
  direction: 'left' | 'right';
  /** Matches the design system's button sizes; the drawn size comes from its icon token. */
  size?: 'sm' | 'md';
}

/** Solid block arrow that inherits the surrounding text colour, so it stays legible on filled buttons. */
export function ArrowIcon({ direction, size = 'sm' }: ArrowIconProps) {
  return (
    <svg className={`arrow-icon arrow-icon--${size}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={ARROW_PATHS[direction]} />
    </svg>
  );
}

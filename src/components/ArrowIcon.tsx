interface ArrowIconProps {
  direction: 'left' | 'right';
  /** Matches the design system's button sizes; the drawn size comes from its typography tokens. */
  size?: 'sm' | 'md';
}

/** Solid block arrow that inherits the surrounding text colour, so it stays legible on filled buttons. */
export function ArrowIcon({ direction, size = 'sm' }: ArrowIconProps) {
  return (
    <svg
      className={`arrow-icon arrow-icon--${size}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M2 9h11V4l9 8-9 8v-5H2z"
        transform={direction === 'left' ? 'scale(-1,1) translate(-24,0)' : undefined}
      />
    </svg>
  );
}

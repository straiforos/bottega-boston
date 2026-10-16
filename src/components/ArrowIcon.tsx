interface ArrowIconProps {
  direction: 'left' | 'right';
}

/** Solid block arrow that inherits the surrounding text colour, so it stays legible on filled buttons. */
export function ArrowIcon({ direction }: ArrowIconProps) {
  return (
    <svg
      width="1em"
      height="1em"
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

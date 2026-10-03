export function PlayPauseIcon({ playing, className }: { playing: boolean; className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      {playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 3v18l15-9z" />}
    </svg>
  );
}
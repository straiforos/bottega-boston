const paths = {
  edit: 'M16 3l5 5-12 12H4v-5L16 3zm-1 4L6 16v2h2L17 9l-2-2z',
  delete: 'M8 2h8v3h5v2H3V5h5V2zm2 3h4V4h-4v1zM5 9h14l-1 13H6L5 9zm4 2v8h2v-8H9zm4 0v8h2v-8h-2z',
  add: 'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z',
} as const;

export function GalleryActionIcon({ action }: { action: keyof typeof paths }) {
  return (
    <svg className="arrow-icon arrow-icon--sm" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[action]} />
    </svg>
  );
}

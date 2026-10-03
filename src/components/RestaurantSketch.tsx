export function RestaurantSketch({
  kind = 'pasta',
  small = false,
}: {
  kind?: 'pasta' | 'lemon' | 'pot' | 'market';
  small?: boolean;
}) {
  return (
    <svg
      className={`sketch${small ? ' sketch-small' : ''}`}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="var(--bt-border-width)"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'lemon' ? (
        <>
          <path d="M19 57C12 44 23 24 44 22c15-9 33 4 35 22 12 15-5 37-25 36C39 87 22 74 19 57Z" />
          <path d="M43 23c1-13 17-15 26-12-3 11-15 15-26 12ZM30 44l3-5m-3 17 2 4m13 8 5 2m12-33 4 5" />
        </>
      ) : kind === 'pot' ? (
        <>
          <path d="M22 46h58l-5 37H29ZM23 53H12v14h14m52-14h10v14H77M20 45h63M58 6v27m-8-27v12m16-12v12M51 20c-13 2-12 9 1 9 19-1 22 8 5 9M41 30c-10 3-7 11 7 12m15-8v11" />
          <path d="M35 58v13m31-13v13" />
        </>
      ) : kind === 'market' ? (
        <>
          <path d="M18 45h64v41H18ZM11 27h78l-7 18H18ZM30 27l-4 18m24-18v18m20-18 5 18M35 61h16v25m12-27h12v14H63Z" />
          <path d="M20 20h60M12 45c3 8 12 8 16 0 4 8 14 8 19 0 5 8 15 8 20 0 5 8 14 8 19 0" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="67" rx="36" ry="18" />
          <ellipse cx="47" cy="66" rx="28" ry="11" />
          <path d="M25 65c13-15 25 15 38-1M25 71c13-15 25 15 38-1M30 60c13-15 25 15 33 0M64 9l14 25m-9-28 14 25m-9-27 14 25M73 31c-8 5-2 11 5 6l14 25M76 36c-13 9-13 20-20 25M71 34c-15 12-11 26-24 27" />
        </>
      )}
    </svg>
  );
}

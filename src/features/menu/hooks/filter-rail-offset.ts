/**
 * Scroll math for the menu filter rail.
 *
 * The rail's inner sticky wrapper spans the viewport and vertically centers the
 * filter once it sticks. Before it sticks the filter must stay at its natural
 * (top-aligned) document position, so we slide it down from that position to
 * the centered offset as the page scrolls toward the stick point:
 *
 *   pre-stick:  filterY = railTop - scrollY + offset(scrollY)
 *   stuck:      filterY = offset(scrollY)
 *
 * A linear offset from 0 at scrollY = 0 to the centered offset at the stick
 * point (scrollY = railTop) keeps filterY continuous across the stick point.
 */
export interface FilterRailGeometry {
  scrollY: number;
  /** Natural (un-stuck) document top of the rail. */
  railTop: number;
  viewportH: number;
  /** Sticky site-header height; the centered filter must clear it. */
  headerH: number;
  /** Rendered filter height. */
  filterH: number;
}

export function filterRailOffset({ scrollY, railTop, viewportH, headerH, filterH }: FilterRailGeometry): number {
  // Centered in the visible area below the sticky header, but never higher
  // than the header itself (guards against a filter taller than the viewport).
  const centered = Math.max(headerH, (viewportH + headerH - filterH) / 2);
  const progress = Math.min(1, Math.max(0, scrollY / Math.max(1, railTop)));
  return centered * progress;
}

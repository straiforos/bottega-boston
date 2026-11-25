import { useLayoutEffect, useRef } from 'react';

/**
 * Keeps the sticky filter parked under the site header.
 *
 * The rail column stays a full-height grid item so `position: sticky` works
 * while the dish list scrolls; the inner `.menu-filter-sticky` panel sticks
 * and scrolls internally when the filter stack is taller than the viewport.
 *
 * We deliberately do *not* translate the filter toward vertical center — that
 * offset was recalculated whenever a category change shrank the rail, which
 * made the filter chrome itself jump.
 */
export function useMenuFilterRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const syncStickyTop = () => {
      const header = document.querySelector<HTMLElement>('.shared-header-stack');
      document.documentElement.style.setProperty('--menu-sticky-top', `${header?.offsetHeight ?? 0}px`);
    };

    syncStickyTop();
    window.addEventListener('resize', syncStickyTop);
    return () => {
      window.removeEventListener('resize', syncStickyTop);
      document.documentElement.style.removeProperty('--menu-sticky-top');
    };
  }, []);

  return { railRef, stickyRef, filterRef };
}

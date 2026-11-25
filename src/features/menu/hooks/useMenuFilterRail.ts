import { useEffect, useRef } from 'react';
import { filterRailOffset } from './filter-rail-offset';

/**
 * Positions the menu filter so it is top-aligned at the top of the page and
 * vertically centered in the viewport while scrolling. The rail column stays a
 * static grid item; the inner `.menu-filter-sticky` wrapper does the sticking
 * (CSS max-height + overflow-y:auto when the stack is taller than the viewport),
 * and this hook slides a short filter between its natural position and the
 * centered position (see filter-rail-offset.ts for the math).
 *
 * Desktop only; the phone layout keeps the filter in normal flow.
 */
export function useMenuFilterRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    let frame = 0;

    const syncStickyTop = () => {
      const header = document.querySelector<HTMLElement>('.shared-header-stack');
      document.documentElement.style.setProperty('--menu-sticky-top', `${header?.offsetHeight ?? 0}px`);
    };

    const update = () => {
      frame = 0;
      syncStickyTop();
      const rail = railRef.current;
      const sticky = stickyRef.current;
      const filter = filterRef.current;
      if (!rail || !filter) return;
      if (!desktop.matches) {
        filter.style.transform = '';
        return;
      }

      // When CSS overflow is active, leave the stack top-aligned in the panel.
      if (sticky && sticky.scrollHeight > sticky.clientHeight + 1) {
        filter.style.transform = '';
        return;
      }

      const header = document.querySelector<HTMLElement>('.shared-header-stack');
      const offset = filterRailOffset({
        scrollY: window.scrollY,
        railTop: rail.getBoundingClientRect().top + window.scrollY,
        viewportH: window.innerHeight,
        headerH: header?.offsetHeight ?? 0,
        filterH: filter.offsetHeight,
      });
      filter.style.transform = offset > 0 ? `translateY(${offset}px)` : '';
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    desktop.addEventListener('change', schedule);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (filterRef.current) ro?.observe(filterRef.current);
    update();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      desktop.removeEventListener('change', schedule);
      ro?.disconnect();
      document.documentElement.style.removeProperty('--menu-sticky-top');
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { railRef, stickyRef, filterRef };
}

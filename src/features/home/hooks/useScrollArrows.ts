import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A padded scroller's snap positions rest one inner padding in from its true edge, so that
 * padding is dead space the arrows must not read as room still left to travel.
 */
const MIN_EDGE = 1;

function edgePadding(el: HTMLElement) {
  const style = getComputedStyle(el);
  return {
    start: Number.parseFloat(style.paddingLeft) || 0,
    end: Number.parseFloat(style.paddingRight) || 0,
  };
}

/** Tracks whether a horizontal scroller can move either way, and pages it by its visible width. */
export function useScrollArrows<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { start, end } = edgePadding(el);
    setCanPrev(el.scrollLeft > start + MIN_EDGE);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - end - MIN_EDGE);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const page = (direction: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth, top: 0 });
  };

  return { ref, canPrev, canNext, page };
}

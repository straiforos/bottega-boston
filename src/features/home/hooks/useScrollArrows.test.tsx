import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollArrows } from './useScrollArrows';

/** Geometry measured on the live site: events row 1176px wide, 1656px of content, 12px inner padding. */
const EVENTS = { clientWidth: 1176, scrollWidth: 1656, padding: '12px' };
/** The gallery row has no inner padding, so its true edge is its resting edge. */
const GALLERY = { clientWidth: 1280, scrollWidth: 1600, padding: '0px' };

/** Each track reports its own arrow state, so a leftover render from another test can't answer for it. */
function Harness() {
  const arrows = useScrollArrows<HTMLDivElement>([]);
  return (
    <div
      ref={arrows.ref}
      data-testid="track"
      data-prev={arrows.canPrev ? 'true' : 'false'}
      data-next={arrows.canNext ? 'true' : 'false'}
    />
  );
}

function shown(el: HTMLDivElement) {
  return { canPrev: el.dataset.prev === 'true', canNext: el.dataset.next === 'true' };
}

function setTrack(el: HTMLDivElement, geom: typeof EVENTS, scrollLeft: number) {
  const geometry = { scrollLeft, clientWidth: geom.clientWidth, scrollWidth: geom.scrollWidth };
  for (const [key, value] of Object.entries(geometry)) {
    Object.defineProperty(el, key, { configurable: true, value });
  }
  const original = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((node, pseudo) =>
    node === el
      ? ({ paddingLeft: geom.padding, paddingRight: geom.padding } as CSSStyleDeclaration)
      : original(node as Element, pseudo),
  );
}

function scrollTo(el: HTMLDivElement, geom: typeof EVENTS, scrollLeft: number) {
  setTrack(el, geom, scrollLeft);
  act(() => el.dispatchEvent(new Event('scroll')));
}

function mount(geom: typeof EVENTS, scrollLeft: number) {
  const el = render(<Harness />).getByTestId('track') as HTMLDivElement;
  setTrack(el, geom, scrollLeft);
  act(() => el.dispatchEvent(new Event('scroll')));
  return el;
}

beforeEach(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', Observer);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useScrollArrows', () => {
  it('retires the back arrow while the row rests on its own left padding', () => {
    const el = mount(EVENTS, 240);
    expect(shown(el)).toEqual({ canPrev: true, canNext: true });
    scrollTo(el, EVENTS, 12);
    expect(shown(el).canPrev).toBe(false);
  });

  it('retires the forward arrow once only the right padding is left', () => {
    const el = mount(EVENTS, 240);
    scrollTo(el, EVENTS, EVENTS.scrollWidth - EVENTS.clientWidth);
    expect(shown(el)).toEqual({ canPrev: true, canNext: false });
  });

  it('still shows the back arrow when a padded row has a whole card left to reveal', () => {
    const el = mount(EVENTS, 240);
    scrollTo(el, EVENTS, 256);
    expect(shown(el).canPrev).toBe(true);
  });

  it('treats a pixel of dead padding as the end of the track', () => {
    const el = mount(EVENTS, 240);
    scrollTo(el, EVENTS, 12.5);
    expect(shown(el).canPrev).toBe(false);
  });

  it('keeps an unpadded row retiring its arrows at the true edges', () => {
    const el = mount(GALLERY, 160);
    expect(shown(el)).toEqual({ canPrev: true, canNext: true });
    scrollTo(el, GALLERY, 0);
    expect(shown(el).canPrev).toBe(false);
    scrollTo(el, GALLERY, GALLERY.scrollWidth - GALLERY.clientWidth);
    expect(shown(el).canNext).toBe(false);
  });
});

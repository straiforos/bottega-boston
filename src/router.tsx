import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { scrollToSection } from './lib/scroll-to-section';

type HistoryState = { __TSR_index?: number } | null;

export const getRouter = () => {
  const queryClient = new QueryClient();

  // TanStack re-anchors the window (usually to the top) every time a route
  // load settles — including the *initial* page load, which yanked the menu
  // out from under guests mid-scroll. The scrollRestoration function decides
  // per navigation: the initial load never touches the scroll, a link click
  // lands at the top, and browser back/forward restores the previous spot.
  let scrollDecision = false;
  let scrollToTopOnRender = false;
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: () => scrollDecision,
    defaultPreloadStaleTime: 0,
  });
  router.subscribe('onBeforeLoad', (event) => {
    const from = event.fromLocation as { state: HistoryState } | null | undefined;
    if (!from) {
      // Initial page load: the browser owns the scroll position.
      scrollDecision = false;
      scrollToTopOnRender = false;
      return;
    }
    const nextIndex = (router.latestLocation.state as HistoryState)?.__TSR_index ?? 0;
    const prevIndex = from.state?.__TSR_index ?? 0;
    if (nextIndex > prevIndex) {
      // Link click: always land at the top, ignoring any stale saved position.
      scrollDecision = false;
      scrollToTopOnRender = true;
    } else {
      // Back/forward: restore the saved position. Replace: stay put.
      scrollDecision = nextIndex < prevIndex;
      scrollToTopOnRender = false;
    }
  });
  router.subscribe('onRendered', () => {
    if (!scrollToTopOnRender) return;
    scrollToTopOnRender = false;
    // Links to a section (#locations, #events) land on that section; others at the top.
    const hash = router.state.location.hash;
    window.scrollTo(0, 0);
    if (!hash) return;
    // The new page's sections settle over a moment; re-aim a few times.
    for (const delay of [100, 400, 900]) {
      window.setTimeout(() => scrollToSection(hash), delay);
    }
  });

  return router;
};

import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

type HistoryState = { __TSR_index?: number } | null;

export const getRouter = () => {
  const queryClient = new QueryClient();

  // TanStack re-anchors the window (usually to the top) every time a route
  // load settles — including the *initial* page load, which yanked the menu
  // out from under guests mid-scroll. The scrollRestoration function decides
  // per navigation: the initial load never touches the scroll, a link click
  // lands at the top, and browser back/forward restores the previous spot.
  let scrollDecision = false;
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
      return;
    }
    const nextIndex = (router.latestLocation.state as HistoryState)?.__TSR_index ?? 0;
    const prevIndex = from.state?.__TSR_index ?? 0;
    // New entry (link click) → scroll to top; back/forward → restore; replace → stay.
    scrollDecision = nextIndex !== prevIndex;
  });

  return router;
};

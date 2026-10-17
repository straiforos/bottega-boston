import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // scrollRestoration re-anchors the page (often to the top) after a route
    // load finishes, which yanked the menu out from under guests mid-scroll.
    // Disabled so the browser owns the scroll position at all times.
    defaultPreloadStaleTime: 0,
  });

  return router;
};

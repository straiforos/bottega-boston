import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export const getRouter = () => {
  const queryClient = new QueryClient();

  // TanStack re-anchors the window (usually to the top) every time a route
  // load settles — including the *initial* page load, which yanked the menu
  // out from under guests mid-scroll. The scrollRestoration function vetoes
  // the reset until the guest performs a real navigation; back/forward still
  // restore their previous positions afterwards.
  let hasNavigated = false;
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: () => hasNavigated,
    defaultPreloadStaleTime: 0,
  });
  router.subscribe('onBeforeLoad', (event) => {
    if (event.fromLocation) hasNavigated = true;
  });

  return router;
};

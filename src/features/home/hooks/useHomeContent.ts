import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { homeContentQueryOptions, type HomeContent } from '@/lib/home/home-content';

const siteRoute = getRouteApi('/_site');
const HOME_KEY0 = homeContentQueryOptions.queryKey[0];

/**
 * Home `home_content` from the `/_site` loader (SSR D1 query, dehydrated).
 *
 * Browser QueryClient starts empty — `getServerSnapshot` always returns loader
 * `home` so hydration matches SSR HTML. Staff saves patch the cache; we
 * subscribe so the page updates without a remount refetch flash.
 */
export function useHomeContent() {
  const { home, homeFromServer } = siteRoute.useLoaderData();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  // Lazy-prime during render (before siblings like LocationsSection subscribe)
  // so nothing kicks a client fetch of empty hero defaults over SSR HTML.
  if (queryClient.getQueryData(homeContentQueryOptions.queryKey) === undefined) {
    queryClient.setQueryData(homeContentQueryOptions.queryKey, home);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useSyncExternalStore(
    (onStoreChange) =>
      queryClient.getQueryCache().subscribe((event) => {
        if (event?.query.queryKey[0] === HOME_KEY0) onStoreChange();
      }),
    () => queryClient.getQueryData<HomeContent>(homeContentQueryOptions.queryKey) ?? home,
    () => home,
  );

  return {
    data,
    homeFromServer,
    /** True after client mount — hero may paint once hydrated if SSR had no D1. */
    isFetchedAfterMount: mounted,
  };
}

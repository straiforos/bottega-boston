import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { homeContentQueryOptions, type HomeContent } from '@/lib/home/home-content';

const siteRoute = getRouteApi('/_site');
const HOME_KEY0 = homeContentQueryOptions.queryKey[0];

/**
 * Home `home_content` from the `/_site` loader (SSR D1 query).
 *
 * Browser QueryClient starts empty — `getServerSnapshot` always returns loader
 * `home` so hydration matches SSR HTML. Staff saves patch the cache; we
 * subscribe so the page updates without a remount refetch flash.
 *
 * If the loader had no photo (prerender/CI without D1), fetch once on the client.
 */
export function useHomeContent() {
  const { home, homeFromServer } = siteRoute.useLoaderData();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  if (queryClient.getQueryData(homeContentQueryOptions.queryKey) === undefined) {
    queryClient.setQueryData(homeContentQueryOptions.queryKey, home);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const cached = queryClient.getQueryData<HomeContent>(homeContentQueryOptions.queryKey) ?? home;
    if (homeFromServer && cached.hero.imageUrl.trim()) return;
    void queryClient.fetchQuery(homeContentQueryOptions);
  }, [home, homeFromServer, queryClient]);

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
    isFetchedAfterMount: mounted,
  };
}

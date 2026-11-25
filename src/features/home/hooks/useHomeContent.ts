import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { defaultHomeContent, homeContentQueryOptions } from '@/lib/home/home-content';

const homeRoute = getRouteApi('/_site/');

/**
 * Home `home_content` with SSR seed from the index loader.
 *
 * `useQuery` alone flashes bundled defaults on the client because the loader’s
 * `ensureQueryData` fills a server QueryClient that is not dehydrated — the
 * loader payload is. `initialData` from that payload keeps story/cards/hero
 * copy stable across hydrate; staff saves still invalidate + refetch.
 */
export function useHomeContent() {
  const { home, homeFromServer } = homeRoute.useLoaderData();
  const query = useQuery({
    ...homeContentQueryOptions,
    initialData: home ?? defaultHomeContent,
  });
  return { ...query, data: query.data ?? defaultHomeContent, homeFromServer };
}

import { createFileRoute } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import { HomePage } from '@/features/home/HomePage';
import { defaultHomeContent, homeContentQueryOptions, type HomeContent } from '@/lib/home/home-content';
import { pageHead } from '@/lib/seo/page-head';

export type HomeLoaderData = {
  home: HomeContent;
  /** True when D1 answered; false on CI prerender fallback (hero withholds the photo). */
  homeFromServer: boolean;
};

export const Route = createFileRoute('/_site/')({
  // Prefetch when D1 is available. CI prerender has no DB — swallow so the
  // shell still builds; HeroSection waits/fades and never paints a stale default.
  loader: async ({ context: { queryClient } }): Promise<HomeLoaderData> => {
    try {
      const home = await queryClient.ensureQueryData(homeContentQueryOptions);
      return { home, homeFromServer: true };
    } catch {
      return { home: defaultHomeContent, homeFromServer: false };
    }
  },
  head: ({ loaderData }) => {
    const heroImageUrl = loaderData?.home.hero.imageUrl ?? defaultHomeContent.hero.imageUrl;
    const head = pageHead({
      ...restaurantContent.metadata.home,
      path: '/',
      image: heroImageUrl,
    });
    return {
      ...head,
      links: [
        ...head.links,
        // Kick off the same photo the hero paints so LCP and social share match.
        { rel: 'preload', as: 'image', href: heroImageUrl },
      ],
    };
  },
  component: HomePage,
});

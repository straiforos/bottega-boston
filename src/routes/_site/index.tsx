import { createFileRoute } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import { HomePage } from '@/features/home/HomePage';
import { homeContentQueryOptions } from '@/lib/home/home-content';

export const Route = createFileRoute('/_site/')({
  // Prefetch when D1 is available. CI prerender has no DB — swallow so the
  // shell still builds; HeroSection waits/fades and never paints a stale default.
  loader: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(homeContentQueryOptions);
    } catch {
      /* client refetch / live SSR will populate */
    }
  },
  head: () => ({
    meta: [
      { title: restaurantContent.metadata.home.title },
      { name: 'description', content: restaurantContent.metadata.home.description },
      { property: 'og:title', content: restaurantContent.metadata.home.title },
      { property: 'og:description', content: restaurantContent.metadata.home.socialDescription },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: HomePage,
});

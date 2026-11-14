import { createFileRoute } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import markDishImagesLoaded from '@/features/menu/mark-dish-images-loaded.js?raw';
import { MenuPage } from '@/features/menu/MenuPage';
import { menuQueryOptions } from '@/lib/menu/menu-api';

export const Route = createFileRoute('/_site/menu')({
  // Prefetch so SSR HTML includes dish <img src> tags; CI prerender has no DB.
  loader: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(menuQueryOptions);
    } catch {
      /* client refetch / live SSR will populate */
    }
  },
  head: () => ({
    meta: [
      { title: restaurantContent.metadata.menu.title },
      { name: 'description', content: restaurantContent.metadata.menu.description },
      { property: 'og:title', content: restaurantContent.metadata.menu.title },
      { property: 'og:description', content: restaurantContent.metadata.menu.socialDescription },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    scripts: [{ children: markDishImagesLoaded }],
  }),
  component: MenuPage,
});

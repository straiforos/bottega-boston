import { createFileRoute } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import markDishImagesLoaded from '@/features/menu/mark-dish-images-loaded.js?raw';
import { MenuPage } from '@/features/menu/MenuPage';
import { menuQueryOptions } from '@/lib/menu/menu-api';
import { pageHead } from '@/lib/seo/page-head';

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
    ...pageHead({
      ...restaurantContent.metadata.menu,
      path: '/menu',
    }),
    scripts: [{ children: markDishImagesLoaded }],
  }),
  component: MenuPage,
});

import { createFileRoute } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import { MenuPage } from '@/features/menu/MenuPage';

export const Route = createFileRoute('/menu')({
  head: () => ({
    meta: [
      { title: restaurantContent.metadata.menu.title },
      { name: 'description', content: restaurantContent.metadata.menu.description },
      { property: 'og:title', content: restaurantContent.metadata.menu.title },
      { property: 'og:description', content: restaurantContent.metadata.menu.socialDescription },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: MenuPage,
});

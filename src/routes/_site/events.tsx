import { createFileRoute } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import { EventsPage } from '@/features/events/EventsPage';
import { eventsQueryOptions } from '@/lib/events/events-api';
import { pageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/events')({
  loader: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(eventsQueryOptions);
    } catch {
      /* client refetch / live SSR will populate */
    }
  },
  head: () =>
    pageHead({
      ...restaurantContent.metadata.events,
      path: '/events',
    }),
  component: EventsPage,
});

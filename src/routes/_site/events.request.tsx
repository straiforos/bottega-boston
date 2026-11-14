import { createFileRoute } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import { RequestPage } from '@/features/requests/RequestPage';
import { pageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/events/request')({
  head: () =>
    pageHead({
      ...restaurantContent.metadata.eventsRequest,
      path: '/events/request',
      twitterCard: 'summary',
    }),
  component: () => <RequestPage kind="space" />,
});

import { createFileRoute } from '@tanstack/react-router';
import { RequestPage } from '@/features/requests/RequestPage';

export const Route = createFileRoute('/_site/events/request')({
  head: () => ({
    meta: [
      { title: 'Host your event at Bottega | private parties' },
      { name: 'description', content: 'Request Bottega’s space for birthdays, showers and team dinners, with optional Italian catering.' },
      { property: 'og:title', content: 'Host your event at Bottega' },
      { property: 'og:description', content: 'Tell us about your party and we’ll check availability.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: () => <RequestPage kind="space" />,
});

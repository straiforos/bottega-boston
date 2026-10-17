import { createFileRoute } from '@tanstack/react-router';
import { EventsAdminPage } from '@/features/events/EventsAdminPage';

export const Route = createFileRoute('/_site/admin/events')({
  head: () => ({
    meta: [
      { title: 'Events | Bottega staff' },
      { name: 'description', content: 'Staff tools for Bottega events.' },
      { property: 'og:title', content: 'Events | Bottega staff' },
      { property: 'og:description', content: 'Staff tools for Bottega events.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: EventsAdminPage,
});

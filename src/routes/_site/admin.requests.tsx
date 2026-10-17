import { createFileRoute } from '@tanstack/react-router';
import { RequestsInbox } from '@/features/requests/RequestsInbox';

export const Route = createFileRoute('/_site/admin/requests')({
  head: () => ({
    meta: [
      { title: 'Requests — Bottega staff' },
      { name: 'description', content: 'Staff inbox for Bottega catering and event requests.' },
      { property: 'og:title', content: 'Requests — Bottega staff' },
      { property: 'og:description', content: 'Staff inbox for Bottega catering and event requests.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: RequestsInbox,
});

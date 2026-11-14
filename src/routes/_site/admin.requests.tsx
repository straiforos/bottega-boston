import { createFileRoute } from '@tanstack/react-router';
import { RequestsInbox } from '@/features/requests/RequestsInbox';
import { staffPageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/admin/requests')({
  head: () =>
    staffPageHead({
      title: 'Requests | Bottega staff',
      description: 'Staff inbox for Bottega catering and event requests.',
    }),
  component: RequestsInbox,
});

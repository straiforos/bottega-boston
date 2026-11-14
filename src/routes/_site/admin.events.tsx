import { createFileRoute } from '@tanstack/react-router';
import { EventsAdminPage } from '@/features/events/EventsAdminPage';
import { staffPageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/admin/events')({
  head: () =>
    staffPageHead({
      title: 'Events | Bottega staff',
      description: 'Staff tools for Bottega events.',
    }),
  component: EventsAdminPage,
});

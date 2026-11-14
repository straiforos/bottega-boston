import { createFileRoute } from '@tanstack/react-router';
import { EventEditorPage } from '@/features/events/EventEditor';
import { staffPageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/admin/events_/$eventId')({
  head: () =>
    staffPageHead({
      title: 'Edit event | Bottega staff',
      description: 'Staff editor for a Bottega event.',
    }),
  component: EventEditorRoute,
});

function EventEditorRoute() {
  const { eventId } = Route.useParams();
  return <EventEditorPage eventId={eventId} />;
}

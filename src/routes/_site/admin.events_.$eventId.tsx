import { createFileRoute } from '@tanstack/react-router';
import { EventEditorPage } from '@/features/events/EventEditor';

export const Route = createFileRoute('/_site/admin/events_/$eventId')({
  head: () => ({
    meta: [
      { title: 'Edit event | Bottega staff' },
      { name: 'description', content: 'Staff editor for a Bottega event.' },
      { property: 'og:title', content: 'Edit event | Bottega staff' },
      { property: 'og:description', content: 'Staff editor for a Bottega event.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: EventEditorRoute,
});

function EventEditorRoute() {
  const { eventId } = Route.useParams();
  return <EventEditorPage eventId={eventId} />;
}

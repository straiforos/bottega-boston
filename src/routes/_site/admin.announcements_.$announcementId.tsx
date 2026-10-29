import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementEditorPage } from '@/features/announcements/AnnouncementEditor';

export const Route = createFileRoute('/_site/admin/announcements_/$announcementId')({
  head: () => ({
    meta: [
      { title: 'Edit announcement | Bottega staff' },
      { name: 'description', content: 'Staff editor for a Bottega guest announcement.' },
      { property: 'og:title', content: 'Edit announcement | Bottega staff' },
      { property: 'og:description', content: 'Staff editor for a Bottega guest announcement.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: AnnouncementEditorRoute,
});

function AnnouncementEditorRoute() {
  const { announcementId } = Route.useParams();
  return <AnnouncementEditorPage announcementId={announcementId} />;
}

import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementEditorPage } from '@/features/announcements/AnnouncementEditor';
import { staffPageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/admin/announcements_/$announcementId')({
  head: () =>
    staffPageHead({
      title: 'Edit announcement | Bottega staff',
      description: 'Staff editor for a Bottega guest announcement.',
    }),
  component: AnnouncementEditorRoute,
});

function AnnouncementEditorRoute() {
  const { announcementId } = Route.useParams();
  return <AnnouncementEditorPage announcementId={announcementId} />;
}

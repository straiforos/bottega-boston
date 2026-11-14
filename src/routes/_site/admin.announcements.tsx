import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsAdminPage } from '@/features/announcements/AnnouncementsAdminPage';
import { staffPageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/admin/announcements')({
  head: () =>
    staffPageHead({
      title: 'Announcements | Bottega staff',
      description: 'Staff tools for Bottega guest announcements.',
    }),
  component: AnnouncementsAdminPage,
});

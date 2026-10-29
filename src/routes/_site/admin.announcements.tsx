import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsAdminPage } from '@/features/announcements/AnnouncementsAdminPage';

export const Route = createFileRoute('/_site/admin/announcements')({
  head: () => ({
    meta: [
      { title: 'Announcements | Bottega staff' },
      { name: 'description', content: 'Staff tools for Bottega guest announcements.' },
      { property: 'og:title', content: 'Announcements | Bottega staff' },
      { property: 'og:description', content: 'Staff tools for Bottega guest announcements.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: AnnouncementsAdminPage,
});

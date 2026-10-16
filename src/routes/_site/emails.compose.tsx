import { createFileRoute } from '@tanstack/react-router';
import { EmailEditorPage } from '@/features/emails/EmailEditorPage';

export const Route = createFileRoute('/_site/emails/compose')({
  head: () => ({
    meta: [
      { title: 'Compose Pasta Club email — Bottega staff' },
      { name: 'description', content: 'Staff editor for Bottega Pasta Club emails.' },
      { property: 'og:title', content: 'Compose Pasta Club email — Bottega staff' },
      { property: 'og:description', content: 'Staff editor for Bottega Pasta Club emails.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: () => <EmailEditorPage mode="compose" />,
});

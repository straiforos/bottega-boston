import { createFileRoute } from '@tanstack/react-router';
import { EmailEditorPage } from '@/features/emails/EmailEditorPage';

export const Route = createFileRoute('/_site/emails/welcome')({
  head: () => ({
    meta: [
      { title: 'Welcome email — Bottega staff' },
      { name: 'description', content: 'Staff editor for the automatic Pasta Club welcome email.' },
      { property: 'og:title', content: 'Welcome email — Bottega staff' },
      { property: 'og:description', content: 'Staff editor for the automatic Pasta Club welcome email.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: () => <EmailEditorPage mode="template" templateKey="welcome" />,
});

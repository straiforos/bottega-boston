import { createFileRoute } from '@tanstack/react-router';
import { EmailsWorkspace } from '@/features/emails/EmailsWorkspace';

export const Route = createFileRoute('/_site/emails')({
  head: () => ({
    meta: [
      { title: 'Pasta Club emails — Bottega staff' },
      { name: 'description', content: 'Staff workspace for Bottega Pasta Club newsletters, templates and subscribers.' },
      { property: 'og:title', content: 'Pasta Club emails — Bottega staff' },
      { property: 'og:description', content: 'Staff workspace for Bottega Pasta Club emails.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: EmailsWorkspace,
});

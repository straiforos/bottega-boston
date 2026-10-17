import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { EmailEditorPage } from '@/features/emails/EmailEditorPage';

export const Route = createFileRoute('/_site/emails/compose')({
  validateSearch: z.object({ id: z.string().uuid().optional() }),
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
  component: ComposePage,
});

function ComposePage() {
  const { id } = Route.useSearch();
  return <EmailEditorPage key={id ?? 'new'} mode="compose" campaignId={id} />;
}

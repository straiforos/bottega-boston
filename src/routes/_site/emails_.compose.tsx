import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { EmailEditorPage } from '@/features/emails/EmailEditorPage';
import { staffPageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/emails_/compose')({
  validateSearch: z.object({ id: z.string().uuid().optional() }),
  head: () =>
    staffPageHead({
      title: 'Compose Pasta Club email | Bottega staff',
      description: 'Staff editor for Bottega Pasta Club emails.',
    }),
  component: ComposePage,
});

function ComposePage() {
  const { id } = Route.useSearch();
  return <EmailEditorPage key={id ?? 'new'} mode="compose" campaignId={id} />;
}

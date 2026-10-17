import { createFileRoute } from '@tanstack/react-router';
import { EmailEditorPage } from '@/features/emails/EmailEditorPage';

export const Route = createFileRoute('/_site/emails/template/$key')({
  head: () => ({
    meta: [
      { title: 'Edit email template — Bottega staff' },
      { name: 'description', content: 'Staff editor for Bottega email templates.' },
      { property: 'og:title', content: 'Edit email template — Bottega staff' },
      { property: 'og:description', content: 'Staff editor for Bottega email templates.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: TemplatePage,
});

function TemplatePage() {
  const { key } = Route.useParams();
  return <EmailEditorPage key={key} mode="template" templateKey={key} />;
}

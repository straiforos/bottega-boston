import { createFileRoute } from '@tanstack/react-router';
import { EmailEditorPage } from '@/features/emails/EmailEditorPage';
import { staffPageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/emails_/template/$key')({
  head: () =>
    staffPageHead({
      title: 'Edit email template | Bottega staff',
      description: 'Staff editor for Bottega email templates.',
    }),
  component: TemplatePage,
});

function TemplatePage() {
  const { key } = Route.useParams();
  return <EmailEditorPage key={key} mode="template" templateKey={key} />;
}

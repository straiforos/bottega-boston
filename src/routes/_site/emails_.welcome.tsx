import { createFileRoute } from '@tanstack/react-router';
import { EmailEditorPage } from '@/features/emails/EmailEditorPage';
import { staffPageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/emails_/welcome')({
  head: () =>
    staffPageHead({
      title: 'Welcome email | Bottega staff',
      description: 'Staff editor for the automatic Pasta Club welcome email.',
    }),
  component: () => <EmailEditorPage mode="template" templateKey="welcome" />,
});

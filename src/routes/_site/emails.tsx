import { createFileRoute } from '@tanstack/react-router';
import { EmailsWorkspace } from '@/features/emails/EmailsWorkspace';
import { staffPageHead } from '@/lib/seo/page-head';

const tabs = ['newsletters', 'templates', 'subscribers', 'analytics'] as const;
export type EmailTab = (typeof tabs)[number];

export const Route = createFileRoute('/_site/emails')({
  validateSearch: (search: Record<string, unknown>): { tab?: EmailTab } =>
    tabs.includes(search.tab as EmailTab) ? { tab: search.tab as EmailTab } : {},
  head: () =>
    staffPageHead({
      title: 'Pasta Club emails | Bottega staff',
      description: 'Staff workspace for Bottega Pasta Club newsletters, templates and subscribers.',
      socialDescription: 'Staff workspace for Bottega Pasta Club emails.',
    }),
  component: EmailsWorkspace,
});

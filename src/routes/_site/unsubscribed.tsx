import { createFileRoute, createLink } from '@tanstack/react-router';
import { Display, LinkAction, Serif } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { clubContent } from '@/content/en/club';
import { staffPageHead } from '@/lib/seo/page-head';

const HomeLink = createLink(LinkAction);

export const Route = createFileRoute('/_site/unsubscribed')({
  head: () =>
    staffPageHead({
      title: 'Unsubscribed | Bottega Pasta Club',
      description: 'You have left the Bottega Pasta Club email list.',
    }),
  component: UnsubscribedPage,
});

function UnsubscribedPage() {
  const t = clubContent.unsubscribed;
  return (
    <>
      <BottegaHeader />
      <main className="email-page">
        <div className="email-page-inner email-unsubscribed">
          <Display as="h1" size="lg" tone="forest">
            {t.title}
          </Display>
          <Serif tone="ink">{t.body}</Serif>
          <div>
            <HomeLink to="/">{t.home}</HomeLink>
          </div>
        </div>
      </main>
    </>
  );
}

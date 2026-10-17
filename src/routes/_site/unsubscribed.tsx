import { createFileRoute, createLink } from '@tanstack/react-router';
import { Display, LinkAction, Serif } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { clubContent } from '@/content/en/club';

const HomeLink = createLink(LinkAction);

export const Route = createFileRoute('/_site/unsubscribed')({
  head: () => ({
    meta: [
      { title: 'Unsubscribed | Bottega Pasta Club' },
      { name: 'description', content: 'You have left the Bottega Pasta Club email list.' },
      { property: 'og:title', content: 'Unsubscribed | Bottega Pasta Club' },
      { property: 'og:description', content: 'You have left the Bottega Pasta Club email list.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
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

import { createLink } from '@tanstack/react-router';
import { Display, LinkAction, Serif } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { eventsContent } from '@/content/en/events';
import type { RequestKind } from '@/lib/events/requests';
import { RequestForm } from './RequestForm';

const ActionLink = createLink(LinkAction);
const t = eventsContent.requests;

export function RequestPage({ kind }: { kind: RequestKind }) {
  return (
    <>
      <BottegaHeader />
      <main className="request-page">
        <div className="request-page-inner">
          <Display as="h1" size="lg" tone="forest">
            {kind === 'catering' ? t.cateringTitle : t.spaceTitle}
          </Display>
          <Serif as="p" size="md" tone="ink">
            {kind === 'catering' ? t.cateringIntro : t.spaceIntro}
          </Serif>
          <div>
            <ActionLink to="/menu" search={{ section: 'catering' }}>
              {t.cateringMenu}
            </ActionLink>
          </div>
          <RequestForm kind={kind} />
        </div>
      </main>
    </>
  );
}

import { Card, Logo, Serif } from '@/design-system/bottega-f5161c';
import { eventsContent } from '@/content/en/events';

const t = eventsContent;

/**
 * Placeholder for the events row while the list is still arriving: cards in the
 * same shape as the real ones, each holding the Bottega dome mark breathing
 * gently so the section never sits empty or jumps when the events land.
 */
export function EventsLoader({ cards = 3 }: { cards?: number }) {
  return (
    <div className="events-loader" role="status" aria-busy="true">
      <div className="events-grid" aria-hidden="true">
        {Array.from({ length: cards }, (_, index) => (
          <Card key={index} variant="cream" elevated className="events-loader-card">
            <Logo variant="mark" size="lg" tone="ink" alt="" className="events-loader-mark" />
          </Card>
        ))}
      </div>
      <Serif as="p" size="sm" tone="mustard" className="events-loader-caption">
        {t.loading}
      </Serif>
    </div>
  );
}

import { Display, Serif } from '@/design-system/bottega-f5161c';
import { RestaurantSketch } from '@/components/RestaurantSketch';

export function EventsSection() {
  return (
    <section id="events" className="section events">
      <div className="section-inner">
        <p className="eyebrow">Good food. Better company.</p>
        <div className="events-heading">
          <Display size="xl" tone="forest">
            Come hang out
            <br />
            with us.
          </Display>
        </div>
        <div className="event-empty">
          <RestaurantSketch kind="lemon" />
          <Serif size="md" tone="forest">
            No events at the moment.
          </Serif>
          <p>More good times are on the way. Ci vediamo presto!</p>
        </div>
      </div>
    </section>
  );
}

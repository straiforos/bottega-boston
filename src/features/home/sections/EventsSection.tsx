import { Display } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { restaurantContent } from '@/content/en/restaurant';

export function EventsSection() {
  return (
    <section id="events" className="section events bt-surface-dark">
      <div className="events-ribbon">
        <MovingRibbon text={restaurantContent.home.events} variant="terracotta" />
      </div>
      <div className="section-inner">
        <div className="events-heading">
          <Display size="xl" tone="forest">
            Come hang out
            <br />
            with us.
          </Display>
        </div>
      </div>
    </section>
  );
}

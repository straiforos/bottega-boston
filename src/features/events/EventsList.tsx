import { useQuery } from '@tanstack/react-query';
import { createLink } from '@tanstack/react-router';
import { Button } from '@/design-system/bottega-f5161c';
import { ArrowIcon } from '@/components/ArrowIcon';
import { eventsContent } from '@/content/en/events';
import { useStaffSession } from '@/hooks/useStaffSession';
import { eventsQueryOptions, upcomingEvents } from '@/lib/events/events-api';
import { GalleryActionIcon } from '@/features/home/admin/GalleryActionIcon';
import { useScrollArrows } from '@/features/home/hooks/useScrollArrows';
import { EventCard } from './EventCard';

const RouterButton = createLink(Button);
const t = eventsContent;

/** Home page events: side-by-side upcoming cards in a scrolling row, plus request buttons and inline staff editing. */
export function EventsList() {
  const { isAdmin } = useStaffSession();
  const { data } = useQuery(eventsQueryOptions);
  const upcoming = upcomingEvents(data ?? [], new Date());
  const arrows = useScrollArrows<HTMLDivElement>([upcoming.length, isAdmin]);

  return (
    <div className="events-list">
      {upcoming.length > 0 && (
        <div className="events-strip">
          <div className="events-grid" ref={arrows.ref}>
            {upcoming.map((u) => (
              <EventCard key={u.event.id} upcoming={u}>
                {isAdmin && (
                  <div className="event-card-staff">
                    <RouterButton size="sm" aria-label={`${t.staff.edit}: ${u.event.title}`} to="/admin/events/$eventId" params={{ eventId: u.event.id }}>
                      <GalleryActionIcon action="edit" />
                    </RouterButton>
                  </div>
                )}
              </EventCard>
            ))}
          </div>
          {arrows.canPrev && (
            <span className="events-arrow" data-side="prev">
              <Button variant="cream" size="md" aria-label={t.scrollPrev} onClick={() => arrows.page(-1)}>
                <ArrowIcon direction="left" size="md" />
              </Button>
            </span>
          )}
          {arrows.canNext && (
            <span className="events-arrow" data-side="next">
              <Button variant="cream" size="md" aria-label={t.scrollNext} onClick={() => arrows.page(1)}>
                <ArrowIcon direction="right" size="md" />
              </Button>
            </span>
          )}
        </div>
      )}
      <div className="events-actions">
        <RouterButton to="/catering" variant="cream">{t.requestCatering}</RouterButton>
        <RouterButton to="/events/request" variant="accent">{t.bookSpace}</RouterButton>
        {isAdmin && (
          <RouterButton variant="outline" to="/admin/events/$eventId" params={{ eventId: 'new' }}>{t.staff.add}</RouterButton>
        )}
      </div>
    </div>
  );
}

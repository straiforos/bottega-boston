import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createLink } from '@tanstack/react-router';
import { Button } from '@/design-system/bottega-f5161c';
import { eventsContent } from '@/content/en/events';
import { useStaffSession } from '@/hooks/useStaffSession';
import { eventsQueryOptions, upcomingEvents, type BottegaEvent } from '@/lib/events/events-api';
import { GalleryActionIcon } from '@/features/home/admin/GalleryActionIcon';
import { EventCard } from './EventCard';
import { EventEditor } from './EventEditor';

const RouterButton = createLink(Button);
const t = eventsContent;

/** Home page events: upcoming cards, request buttons, and inline staff editing. */
export function EventsList() {
  const { isAdmin } = useStaffSession();
  const { data } = useQuery(eventsQueryOptions);
  const [editing, setEditing] = useState<BottegaEvent | null | undefined>(undefined);
  const upcoming = upcomingEvents(data ?? [], new Date());

  return (
    <div className="events-list">
      {upcoming.length > 0 && (
        <div className="events-grid">
          {upcoming.map((u) => (
            <EventCard key={u.event.id} upcoming={u}>
              {isAdmin && (
                <div className="event-card-staff">
                  <Button size="sm" aria-label={`${t.staff.edit}: ${u.event.title}`} onClick={() => setEditing(u.event)}>
                    <GalleryActionIcon action="edit" />
                  </Button>
                </div>
              )}
            </EventCard>
          ))}
        </div>
      )}
      <div className="events-actions">
        <RouterButton to="/catering" variant="cream">{t.requestCatering}</RouterButton>
        <RouterButton to="/events/request" variant="accent">{t.bookSpace}</RouterButton>
        {isAdmin && (
          <Button variant="outline" onClick={() => setEditing(null)}>{t.staff.add}</Button>
        )}
      </div>
      {isAdmin && <EventEditor open={editing !== undefined} event={editing ?? null} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

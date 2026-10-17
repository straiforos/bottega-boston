import { useState } from 'react';
import { Button, Card, PillLabel, Serif } from '@/design-system/bottega-f5161c';
import { eventsContent } from '@/content/en/events';
import { orderLocations } from '@/content/links';
import { GalleryEditorDialog } from '@/features/home/admin/GalleryEditorDialog';
import type { UpcomingEvent } from '@/lib/events/events-api';
import { ticketEmbedUrl } from '@/lib/events/requests';

const t = eventsContent;

export const formatWhen = (iso: string, timeZone: string) =>
  new Date(iso).toLocaleString('en-US', { timeZone, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** One event (or repeating series) with its next dates and an optional ticket checkout. */
export function EventCard({ upcoming, children }: { upcoming: UpcomingEvent; children?: React.ReactNode }) {
  const { event, next, repeats } = upcoming;
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const ticketUrl = next[0]?.ticketUrl;
  const locationNames = orderLocations.filter((l) => event.locationIds.includes(l.id)).map((l) => l.name);

  return (
    <Card variant="cream" elevated className="event-card bt-surface-light">
      {children}
      {event.imageUrl && <img className="event-card-photo" src={event.imageUrl} alt="" loading="lazy" decoding="async" />}
      <div className="event-card-body">
        {repeats && <PillLabel variant="chip-terracotta">{repeats}</PillLabel>}
        <Serif as="h3" size="md" tone="forest">{event.title}</Serif>
        <p className="event-card-when">
          <time dateTime={next[0].startsAt}>{formatWhen(next[0].startsAt, event.timezone)}</time>
          {locationNames.length > 0 && ` · ${locationNames.join(' · ')}`}
        </p>
        {event.description && <p>{event.description}</p>}
        {repeats && next.length > 1 && (
          <p className="event-card-next">
            {t.nextDates}: {next.slice(1).map((o) => formatWhen(o.startsAt, event.timezone)).join(' · ')}
          </p>
        )}
        {ticketUrl && (
          <div>
            <Button size="sm" onClick={() => setTicketsOpen(true)}>{t.tickets}</Button>
          </div>
        )}
      </div>
      {ticketUrl && (
        <GalleryEditorDialog open={ticketsOpen} label={t.ticketsDialog(event.title)} onCancel={() => setTicketsOpen(false)}>
          <div className="event-tickets">
            <iframe className="event-tickets-frame" src={ticketEmbedUrl(ticketUrl)} title={t.ticketsDialog(event.title)} loading="lazy" />
            <div className="event-editor-actions">
              <Button variant="ghost" href={ticketUrl} target="_blank" aria-label={`${t.ticketsNewTab} (opens in a new tab)`}>
                {t.ticketsNewTab}
              </Button>
              <Button variant="ghost" onClick={() => setTicketsOpen(false)}>{t.close}</Button>
            </div>
          </div>
        </GalleryEditorDialog>
      )}
    </Card>
  );
}

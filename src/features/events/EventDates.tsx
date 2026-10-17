import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, PillLabel } from '@/design-system/bottega-f5161c';
import { eventsContent } from '@/content/en/events';
import { localTime, upcomingOccurrences } from '@/lib/events/occurrences';
import { clearException, eventsQueryOptions, saveException, type BottegaEvent } from '@/lib/events/events-api';

const t = eventsContent.staff;

/** Per-date changes for a repeating event: skip a date or move its start time. */
export function EventDates({ event }: { event: BottegaEvent }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [times, setTimes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const byDate = new Map(event.exceptions.map((x) => [x.occurrenceDate, x]));
  const dates = upcomingOccurrences(event, event.exceptions.filter((x) => !x.skipped), new Date(), 8);

  const run = async (date: string, action: () => Promise<void>) => {
    setBusy(date);
    setError(null);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: eventsQueryOptions.queryKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t save that date.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <fieldset className="event-dates">
      <legend className="bt-field__label">{t.dates}</legend>
      <ul>
        {dates.map((o) => {
          const ex = byDate.get(o.date);
          const time = times[o.date] ?? localTime(new Date(o.startsAt), event.timezone);
          const label = new Date(`${o.date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
          return (
            <li key={o.date}>
              <span>{label}</span>
              {ex?.skipped ? (
                <>
                  <PillLabel variant="chip-terracotta">{t.skipped}</PillLabel>
                  <Button type="button" size="sm" variant="ghost" disabled={busy === o.date} onClick={() => run(o.date, () => clearException(event.id, o.date))}>
                    {t.restore}
                  </Button>
                </>
              ) : (
                <>
                  <input
                    className="bt-input"
                    type="time"
                    aria-label={`${t.changeTime} ${label}`}
                    value={time}
                    onChange={(e) => setTimes({ ...times, [o.date]: e.target.value })}
                  />
                  <Button type="button" size="sm" variant="outline" disabled={busy === o.date || !times[o.date]}
                    onClick={() => run(o.date, () => saveException(event.id, { occurrenceDate: o.date, skipped: false, startTime: time, ticketUrl: ex?.ticketUrl ?? null }))}>
                    {t.saveDate}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" disabled={busy === o.date}
                    onClick={() => run(o.date, () => saveException(event.id, { occurrenceDate: o.date, skipped: true, startTime: null, ticketUrl: null }))}>
                    {t.skip}
                  </Button>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {error && <p className="request-error" role="alert">{error}</p>}
    </fieldset>
  );
}

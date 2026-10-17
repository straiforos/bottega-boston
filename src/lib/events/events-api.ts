import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { isTicketTailorUrl } from './requests';
import {
  describeRecurrence,
  upcomingOccurrences,
  type EventException,
  type Occurrence,
  type Recurrence,
} from './occurrences';

export const EVENT_TZ = 'America/New_York';

export interface BottegaEvent {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly locationId: string;
  readonly imageUrl: string | null;
  readonly startsAt: string;
  readonly durationMinutes: number;
  readonly ticketUrl: string | null;
  readonly published: boolean;
  readonly recurrence: Recurrence | null;
  readonly timezone: string;
  readonly exceptions: readonly EventException[];
}

export interface UpcomingEvent {
  readonly event: BottegaEvent;
  readonly next: readonly Occurrence[];
  readonly repeats: string | null;
}

const recurrenceSchema = z.object({
  freq: z.enum(['weekly', 'biweekly', 'monthly']),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  nth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(-1)]).optional(),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export const parseRecurrence = (raw: unknown): Recurrence | null => {
  const r = recurrenceSchema.safeParse(raw);
  return r.success ? r.data : null;
};

/** Pure: which events still have dates ahead, soonest first. */
export function upcomingEvents(events: readonly BottegaEvent[], now: Date, perEvent = 4): UpcomingEvent[] {
  return events
    .filter((e) => e.published)
    .map((event) => ({
      event,
      next: upcomingOccurrences(event, event.exceptions, now, perEvent),
      repeats: describeRecurrence(event.recurrence),
    }))
    .filter((u) => u.next.length > 0)
    .sort((a, b) => a.next[0].startsAt.localeCompare(b.next[0].startsAt));
}

async function fetchEvents(): Promise<BottegaEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, event_exceptions(occurrence_date, skipped, start_time, ticket_url)')
    .order('starts_at');
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    locationId: row.location_id,
    imageUrl: row.image_url,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    ticketUrl: row.ticket_url,
    published: row.published,
    recurrence: parseRecurrence(row.recurrence),
    timezone: row.timezone,
    exceptions: (row.event_exceptions ?? []).map((x) => ({
      occurrenceDate: x.occurrence_date,
      skipped: x.skipped,
      startTime: x.start_time,
      ticketUrl: x.ticket_url,
    })),
  }));
}

export const eventsQueryOptions = queryOptions({ queryKey: ['events'], queryFn: fetchEvents });

export interface EventDraft {
  title: string;
  description: string;
  locationId: string;
  imageUrl: string | null;
  startsAt: string;
  durationMinutes: number;
  ticketUrl: string;
  published: boolean;
  recurrence: Recurrence | null;
}

export function validateEvent(d: EventDraft): string | null {
  if (!d.title.trim()) return 'Add a title.';
  if (d.title.length > 120) return 'Keep the title under 120 characters.';
  if (d.description.length > 2000) return 'Keep the description under 2000 characters.';
  if (Number.isNaN(new Date(d.startsAt).getTime())) return 'Pick a start date and time.';
  if (d.durationMinutes < 15 || d.durationMinutes > 24 * 60) return 'Length must be between 15 minutes and 24 hours.';
  if (d.ticketUrl.trim() && !isTicketTailorUrl(d.ticketUrl)) return 'Ticket links must be https://…tickettailor.com addresses.';
  if (d.recurrence && !recurrenceSchema.safeParse(d.recurrence).success) return 'Pick at least one day for the repeat.';
  return null;
}

const toRow = (d: EventDraft) => ({
  title: d.title.trim(),
  description: d.description.trim(),
  location_id: d.locationId,
  image_url: d.imageUrl,
  starts_at: d.startsAt,
  duration_minutes: d.durationMinutes,
  ticket_url: d.ticketUrl.trim() || null,
  published: d.published,
  recurrence: d.recurrence as unknown as Json,
  timezone: EVENT_TZ,
  updated_at: new Date().toISOString(),
});

export async function saveEvent(id: string | null, draft: EventDraft) {
  const { error } = id
    ? await supabase.from('events').update(toRow(draft)).eq('id', id)
    : await supabase.from('events').insert(toRow(draft));
  if (error) throw new Error('Couldn’t save the event.');
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw new Error('Couldn’t delete the event.');
}

export async function saveException(eventId: string, ex: EventException) {
  const { error } = await supabase.from('event_exceptions').upsert(
    {
      event_id: eventId,
      occurrence_date: ex.occurrenceDate,
      skipped: ex.skipped,
      start_time: ex.startTime,
      ticket_url: ex.ticketUrl,
    },
    { onConflict: 'event_id,occurrence_date' },
  );
  if (error) throw new Error('Couldn’t save that date.');
}

export async function clearException(eventId: string, date: string) {
  const { error } = await supabase.from('event_exceptions').delete().eq('event_id', eventId).eq('occurrence_date', date);
  if (error) throw new Error('Couldn’t reset that date.');
}

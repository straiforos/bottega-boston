import { z } from 'zod';
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
  readonly locationIds: readonly string[];
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

export interface EventDraft {
  title: string;
  description: string;
  locationIds: string[];
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
  if (!d.locationIds.length) return 'Pick at least one location.';
  if (d.description.length > 2000) return 'Keep the description under 2000 characters.';
  if (Number.isNaN(new Date(d.startsAt).getTime())) return 'Pick a start date and time.';
  if (d.durationMinutes < 15 || d.durationMinutes > 24 * 60) return 'Length must be between 15 minutes and 24 hours.';
  if (d.ticketUrl.trim() && !isTicketTailorUrl(d.ticketUrl)) return 'Ticket links must be https://…tickettailor.com addresses.';
  if (d.recurrence && !recurrenceSchema.safeParse(d.recurrence).success) return 'Pick at least one day for the repeat.';
  return null;
}

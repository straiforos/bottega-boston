import { queryOptions } from '@tanstack/react-query';
import {
  clearException as clearExceptionFn,
  deleteEvent as deleteEventFn,
  fetchEvents,
  saveEvent as saveEventFn,
  saveException as saveExceptionFn,
} from './events.functions';
import {
  EVENT_TZ,
  parseRecurrence,
  upcomingEvents,
  validateEvent,
  type BottegaEvent,
  type EventDraft,
  type UpcomingEvent,
} from './events-shared';
import type { EventException } from './occurrences';

export { EVENT_TZ, parseRecurrence, upcomingEvents, validateEvent };
export type { BottegaEvent, EventDraft, UpcomingEvent };

export const eventsQueryOptions = queryOptions({ queryKey: ['events'], queryFn: () => fetchEvents() });

export async function saveEvent(id: string | null, draft: EventDraft) {
  await saveEventFn({ data: { id, draft } });
}

export async function deleteEvent(id: string) {
  await deleteEventFn({ data: id });
}

export async function saveException(eventId: string, ex: EventException) {
  await saveExceptionFn({ data: { eventId, exception: ex } });
}

export async function clearException(eventId: string, date: string) {
  await clearExceptionFn({ data: { eventId, date } });
}

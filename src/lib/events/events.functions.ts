import { createServerFn } from '@tanstack/react-start';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireStaffSession } from '@/integrations/auth/session-middleware';
import { db, schema } from '@/lib/db';
import type { Json } from '@/lib/json';
import { parseRecurrence, type BottegaEvent, type EventDraft } from './events-shared';
import { isTicketTailorUrl } from './requests';
import type { EventException, Recurrence } from './occurrences';

const recurrenceSchema = z
  .object({
    freq: z.enum(['weekly', 'biweekly', 'monthly']),
    weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    nth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(-1)]).optional(),
    until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  })
  .nullable();

const draftSchema = z.object({
  title: z.string(),
  description: z.string(),
  locationIds: z.array(z.string()),
  imageUrl: z.string().nullable(),
  startsAt: z.string(),
  durationMinutes: z.number().int(),
  ticketUrl: z.string(),
  published: z.boolean(),
  recurrence: recurrenceSchema,
});

function mapEvent(
  row: typeof schema.events.$inferSelect,
  exceptions: (typeof schema.eventExceptions.$inferSelect)[],
): BottegaEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    locationIds: row.locations?.length ? row.locations : row.locationId ? [row.locationId] : [],
    imageUrl: row.imageUrl,
    startsAt: row.startsAt,
    durationMinutes: row.durationMinutes,
    ticketUrl: row.ticketUrl,
    published: row.published,
    recurrence: parseRecurrence(row.recurrence),
    timezone: row.timezone,
    exceptions: exceptions.map((x) => ({
      occurrenceDate: x.occurrenceDate,
      skipped: x.skipped,
      startTime: x.startTime,
      ticketUrl: x.ticketUrl,
    })),
  };
}

export const fetchEvents = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db().select().from(schema.events);
  const exceptions = await db().select().from(schema.eventExceptions);
  const byEvent = new Map<string, typeof exceptions>();
  for (const ex of exceptions) {
    const list = byEvent.get(ex.eventId) ?? [];
    list.push(ex);
    byEvent.set(ex.eventId, list);
  }
  return rows
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((row) => mapEvent(row, byEvent.get(row.id) ?? []));
});

export const saveEvent = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid().nullable(), draft: draftSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const d = data.draft as EventDraft;
    if (!d.title.trim()) throw new Error('Add a title.');
    if (d.ticketUrl.trim() && !isTicketTailorUrl(d.ticketUrl)) {
      throw new Error('Ticket links must be https://…tickettailor.com addresses.');
    }
    const row = {
      title: d.title.trim(),
      description: d.description.trim(),
      locations: d.locationIds,
      locationId: d.locationIds[0] ?? 'brookline',
      imageUrl: d.imageUrl,
      startsAt: d.startsAt,
      durationMinutes: d.durationMinutes,
      ticketUrl: d.ticketUrl.trim() || null,
      published: d.published,
      recurrence: d.recurrence as unknown as Json,
      timezone: 'America/New_York',
      updatedAt: new Date().toISOString(),
    };
    if (data.id) {
      await db().update(schema.events).set(row).where(eq(schema.events.id, data.id));
      return { id: data.id };
    }
    const id = crypto.randomUUID();
    await db().insert(schema.events).values({ id, ...row });
    return { id };
  });

export const deleteEvent = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => z.string().uuid().parse(input))
  .handler(async ({ data: id }) => {
    await db().delete(schema.events).where(eq(schema.events.id, id));
    return { ok: true };
  });

export const saveException = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z
      .object({
        eventId: z.string().uuid(),
        exception: z.object({
          occurrenceDate: z.string(),
          skipped: z.boolean(),
          startTime: z.string().nullable(),
          ticketUrl: z.string().nullable(),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const ex = data.exception as EventException;
    const existing = await db()
      .select()
      .from(schema.eventExceptions)
      .where(
        and(eq(schema.eventExceptions.eventId, data.eventId), eq(schema.eventExceptions.occurrenceDate, ex.occurrenceDate)),
      )
      .limit(1);
    if (existing[0]) {
      await db()
        .update(schema.eventExceptions)
        .set({
          skipped: ex.skipped,
          startTime: ex.startTime,
          ticketUrl: ex.ticketUrl,
        })
        .where(eq(schema.eventExceptions.id, existing[0].id));
    } else {
      await db().insert(schema.eventExceptions).values({
        id: crypto.randomUUID(),
        eventId: data.eventId,
        occurrenceDate: ex.occurrenceDate,
        skipped: ex.skipped,
        startTime: ex.startTime,
        ticketUrl: ex.ticketUrl,
      });
    }
    return { ok: true };
  });

export const clearException = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z.object({ eventId: z.string().uuid(), date: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    await db()
      .delete(schema.eventExceptions)
      .where(
        and(eq(schema.eventExceptions.eventId, data.eventId), eq(schema.eventExceptions.occurrenceDate, data.date)),
      );
    return { ok: true };
  });

export type { Recurrence };

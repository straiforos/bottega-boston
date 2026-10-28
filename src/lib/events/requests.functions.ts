import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, gte, inArray, like } from 'drizzle-orm';
import { z } from 'zod';
import { requireStaffSession } from '@/integrations/auth/session-middleware';
import { db, schema } from '@/lib/db';
import type { Json } from '@/lib/json';
import type { EmailDraft } from '@/lib/email/blocks';
import { getTurnstileSiteKey, verifyTurnstile } from '@/lib/turnstile.server';
import {
  describeLines,
  formatMoney,
  orderTotal,
  plainForEmail,
  priceOrder,
  REQUEST_STATUSES,
  requestSchema,
  type OrderLine,
} from './requests';

export { getTurnstileSiteKey };

const STAFF_INBOX = 'ciao@eatbottega.com';
const MAX_PER_HOUR = 3;

const guestFallback = (kind: 'catering' | 'space'): EmailDraft => ({
  subject: kind === 'catering' ? 'We got your Bottega catering request' : 'We got your Bottega event request',
  preheader: 'Our team will be in touch shortly.',
  blocks: [
    { id: 'r1', type: 'headline', text: 'Grazie, {{guest_name}}!' },
    { id: 'r2', type: 'text', text: 'We received your request for **{{event_date}}** at {{location}}.\n\n{{summary}}' },
    { id: 'r3', type: 'text', text: 'Our team will be in touch shortly to confirm the details.\n\nThe Bottega family' },
  ],
});

const staffFallback: EmailDraft = {
  subject: 'New {{kind}} request from {{guest_name}}',
  preheader: '{{event_date}} · {{location}}',
  blocks: [
    { id: 's1', type: 'headline', text: 'New {{kind}} request' },
    {
      id: 's2',
      type: 'text',
      text: '**{{guest_name}}** · {{guest_email}} · {{guest_phone}}\n\n**When:** {{event_date}}\n**Where:** {{location}}\n\n{{summary}}',
    },
  ],
};

/** Public: a guest asks for catering or the event space. Saved for staff, then confirmed by email. */
export const submitRequest = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => requestSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    if (!(await verifyTurnstile(data.turnstileToken))) throw new Error('Please complete the human check and try again.');

    const since = new Date(Date.now() - 3_600_000).toISOString();
    const recent = await db()
      .select({ id: schema.eventRequests.id })
      .from(schema.eventRequests)
      .where(and(eq(schema.eventRequests.email, data.email), gte(schema.eventRequests.createdAt, since)));
    if (recent.length >= MAX_PER_HOUR) throw new Error('You’ve sent a few requests already. We’ll be in touch soon.');

    let lines: OrderLine[] = [];
    if (data.lines.length) {
      const sections = await db()
        .select({ id: schema.menuSections.id })
        .from(schema.menuSections)
        .where(like(schema.menuSections.name, 'Catering%'));
      const sectionIds = sections.map((s) => s.id);
      const items = sectionIds.length
        ? await db()
            .select({ id: schema.menuItems.id, name: schema.menuItems.name, price: schema.menuItems.price })
            .from(schema.menuItems)
            .where(inArray(schema.menuItems.sectionId, sectionIds))
        : [];
      lines = priceOrder(data.lines, new Map(items.map((i) => [i.id, i])));
    }

    const id = crypto.randomUUID();
    await db()
      .insert(schema.eventRequests)
      .values({
        id,
        kind: data.kind,
        name: data.name,
        email: data.email,
        phone: data.phone,
        locationId: data.locationId,
        requestedFor: data.requestedFor,
        guests: data.guests,
        eventType: data.eventType,
        fulfillment: data.fulfillment,
        address: data.address,
        dietary: data.dietary,
        notes: data.notes,
        orderLines: lines as unknown as Json,
      });

    try {
      const { siteOrigin } = await import('@/lib/email/club.server');
      const { sendTemplate } = await import('@/lib/email/campaigns.server');
      const { restaurantContent } = await import('@/content/en/restaurant');
      const location = restaurantContent.addresses[data.locationId === 'boston' ? 1 : 0]?.name ?? '';
      const when = new Date(data.requestedFor).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'full',
        timeStyle: 'short',
      });
      const summary = [
        data.guests ? `Guests: ${data.guests}` : '',
        data.eventType ? `Event: ${plainForEmail(data.eventType)}` : '',
        data.fulfillment
          ? `${data.fulfillment === 'delivery' ? 'Delivery to' : 'Pickup'} ${plainForEmail(data.address)}`
          : '',
        lines.length
          ? `Order:\n${plainForEmail(describeLines(lines))}\nEstimated total: ${formatMoney(orderTotal(lines))}`
          : '',
        data.dietary ? `Dietary needs: ${plainForEmail(data.dietary)}` : '',
        data.notes ? `Notes: ${plainForEmail(data.notes)}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
      const variables = {
        guest_name: plainForEmail(data.name),
        guest_email: data.email,
        guest_phone: plainForEmail(data.phone),
        event_date: when,
        guest_count: String(data.guests ?? ''),
        location,
        summary,
        kind: data.kind === 'catering' ? 'catering' : 'event space',
      };
      const origin = siteOrigin();
      const guestKey = data.kind === 'catering' ? 'catering-request-received' : 'space-request-received';
      await Promise.allSettled([
        sendTemplate({ key: guestKey, to: data.email, variables }, origin, guestFallback(data.kind)),
        sendTemplate({ key: 'staff-request-alert', to: STAFF_INBOX, variables }, origin, staffFallback),
      ]);
    } catch (sendError) {
      console.error('Request emails failed', sendError);
    }
    return { ok: true as const };
  });

export const listRequests = createServerFn({ method: 'GET' })
  .middleware([requireStaffSession])
  .handler(async () => {
    const data = await db().select().from(schema.eventRequests).orderBy(desc(schema.eventRequests.createdAt)).limit(500);
    return data.map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      email: r.email,
      phone: r.phone,
      location_id: r.locationId,
      requested_for: r.requestedFor,
      guests: r.guests,
      event_type: r.eventType,
      fulfillment: r.fulfillment,
      address: r.address,
      dietary: r.dietary,
      notes: r.notes,
      order_lines: (r.orderLines ?? []) as OrderLine[],
      status: r.status,
      staff_notes: r.staffNotes,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    }));
  });

export const updateRequest = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(REQUEST_STATUSES), staffNotes: z.string().max(5000) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await db()
      .update(schema.eventRequests)
      .set({ status: data.status, staffNotes: data.staffNotes, updatedAt: new Date().toISOString() })
      .where(eq(schema.eventRequests.id, data.id));
    return { ok: true };
  });

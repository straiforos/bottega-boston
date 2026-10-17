import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Json } from '@/integrations/supabase/types';
import type { EmailDraft } from '@/lib/email/blocks';
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
    { id: 's2', type: 'text', text: '**{{guest_name}}** · {{guest_email}} · {{guest_phone}}\n\n**When:** {{event_date}}\n**Where:** {{location}}\n\n{{summary}}' },
  ],
};

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token }),
  });
  const out = (await res.json().catch(() => ({}))) as { success?: boolean };
  return out.success === true;
}

/** Public: the Turnstile site key (publishable) for the request forms. */
export const getTurnstileSiteKey = createServerFn({ method: 'GET' }).handler(async () => ({
  siteKey: process.env.TURNSTILE_SITE_KEY ?? '',
}));

/** Public: a guest asks for catering or the event space. Saved for staff, then confirmed by email. */
export const submitRequest = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => requestSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    if (!(await verifyTurnstile(data.turnstileToken))) throw new Error('Please complete the human check and try again.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const since = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await supabaseAdmin
      .from('event_requests')
      .select('id', { count: 'exact', head: true })
      .eq('email', data.email)
      .gte('created_at', since);
    if ((count ?? 0) >= MAX_PER_HOUR) throw new Error('You’ve sent a few requests already — we’ll be in touch soon.');

    let lines: OrderLine[] = [];
    if (data.lines.length) {
      const { data: sections } = await supabaseAdmin.from('menu_sections').select('id').ilike('name', 'Catering%');
      const { data: items } = await supabaseAdmin
        .from('menu_items')
        .select('id, name, price')
        .in('section_id', (sections ?? []).map((s) => s.id));
      lines = priceOrder(data.lines, new Map((items ?? []).map((i) => [i.id, i])));
    }

    const { data: row, error } = await supabaseAdmin
      .from('event_requests')
      .insert({
        kind: data.kind,
        name: data.name,
        email: data.email,
        phone: data.phone,
        location_id: data.locationId,
        requested_for: data.requestedFor,
        guests: data.guests,
        event_type: data.eventType,
        fulfillment: data.fulfillment,
        address: data.address,
        dietary: data.dietary,
        notes: data.notes,
        order_lines: lines as unknown as Json,
      })
      .select('id')
      .single();
    if (error || !row) {
      console.error('Request insert failed', error);
      throw new Error('That didn’t go through. Please try again.');
    }

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
        data.fulfillment ? `${data.fulfillment === 'delivery' ? 'Delivery to' : 'Pickup'} ${plainForEmail(data.address)}` : '',
        lines.length ? `Order:\n${plainForEmail(describeLines(lines))}\nEstimated total: ${formatMoney(orderTotal(lines))}` : '',
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
        sendTemplate(supabaseAdmin, { key: guestKey, to: data.email, variables }, origin, guestFallback(data.kind)),
        sendTemplate(supabaseAdmin, { key: 'staff-request-alert', to: STAFF_INBOX, variables }, origin, staffFallback),
      ]);
    } catch (sendError) {
      console.error('Request emails failed', sendError);
    }
    return { ok: true as const };
  });

async function assertAdmin(supabase: { rpc: (...a: never[]) => unknown }, userId: string) {
  const { data, error } = await (supabase.rpc as unknown as (
    fn: 'has_role',
    a: { _user_id: string; _role: 'admin' },
  ) => Promise<{ data: unknown; error: unknown }>)('has_role', { _user_id: userId, _role: 'admin' });
  if (error || data !== true) throw new Error('Only Bottega staff can do that.');
}

export const listRequests = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from('event_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw new Error('Couldn’t load requests.');
    return data.map((r) => ({ ...r, order_lines: (r.order_lines ?? []) as unknown as OrderLine[] }));
  });

export const updateRequest = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(REQUEST_STATUSES), staffNotes: z.string().max(5000) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from('event_requests')
      .update({ status: data.status, staff_notes: data.staffNotes, updated_at: new Date().toISOString() })
      .eq('id', data.id);
    if (error) throw new Error('Couldn’t save the request.');
    return { ok: true };
  });

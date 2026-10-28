import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, inArray, isNotNull, like } from 'drizzle-orm';
import { z } from 'zod';
import { requireStaffSession } from '@/integrations/auth/session-middleware';
import { db, schema } from '@/lib/db';
import type { Json } from '@/lib/json';
import { defaultWelcome, emailDraftSchema, WELCOME_KEY, type EmailDraft } from './blocks';

function toDraft(row: { subject: string; preheader: string; blocks: unknown } | null, fallback: EmailDraft): EmailDraft {
  const parsed = row ? emailDraftSchema.safeParse(row) : null;
  return parsed?.success ? parsed.data : fallback;
}

const idSchema = z.string().uuid();
const keySchema = z.string().regex(/^[a-z0-9-]{1,60}$/);

/** Public: a guest joins the Pasta Club. Sends the welcome email once. */
export const joinClub = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(254), consent: z.literal(true) }).parse(input),
  )
  .handler(async ({ data }) => {
    const existing = await db().query.clubSubscribers.findFirst({
      where: (t, { eq: eqFn }) => eqFn(t.email, data.email),
    });
    if (existing && !existing.unsubscribedAt && existing.status === 'active') return { status: 'already' as const };

    const now = new Date().toISOString();
    let row = existing;
    if (existing) {
      await db()
        .update(schema.clubSubscribers)
        .set({ unsubscribedAt: null, consentAt: now, status: 'active' })
        .where(eq(schema.clubSubscribers.id, existing.id));
      row = { ...existing, unsubscribedAt: null, consentAt: now, status: 'active' };
    } else {
      const id = crypto.randomUUID();
      const unsubscribeToken = crypto.randomUUID();
      await db().insert(schema.clubSubscribers).values({ id, email: data.email, unsubscribeToken });
      row = {
        id,
        email: data.email,
        unsubscribeToken,
        welcomeSentAt: null,
        unsubscribedAt: null,
        consentAt: now,
        status: 'active',
        createdAt: now,
      };
    }
    if (!row) throw new Error('Signup failed');

    if (!row.welcomeSentAt) {
      try {
        const { siteOrigin } = await import('./club.server');
        const { sendTemplate } = await import('./campaigns.server');
        await sendTemplate(
          { key: WELCOME_KEY, to: data.email, subscriber: { id: row.id, token: row.unsubscribeToken } },
          siteOrigin(),
          defaultWelcome,
        );
        await db()
          .update(schema.clubSubscribers)
          .set({ welcomeSentAt: now })
          .where(eq(schema.clubSubscribers.id, row.id));
      } catch (sendError) {
        console.error('Welcome email failed', sendError);
      }
    }
    return { status: 'joined' as const };
  });

/** Staff workspace: subscriber count, newsletters with stats, templates. */
export const getWorkspace = createServerFn({ method: 'GET' })
  .middleware([requireStaffSession])
  .handler(async () => {
    const [subscribers, campaigns, templates, sends] = await Promise.all([
      db().select({ id: schema.clubSubscribers.id }).from(schema.clubSubscribers).where(eq(schema.clubSubscribers.status, 'active')),
      db()
        .select({
          id: schema.emailCampaigns.id,
          subject: schema.emailCampaigns.subject,
          status: schema.emailCampaigns.status,
          recipient_count: schema.emailCampaigns.recipientCount,
          failed_count: schema.emailCampaigns.failedCount,
          sent_at: schema.emailCampaigns.sentAt,
          scheduled_for: schema.emailCampaigns.scheduledFor,
          updated_at: schema.emailCampaigns.updatedAt,
        })
        .from(schema.emailCampaigns)
        .orderBy(desc(schema.emailCampaigns.updatedAt))
        .limit(100),
      db()
        .select({
          key: schema.emailTemplates.key,
          kind: schema.emailTemplates.kind,
          name: schema.emailTemplates.name,
          subject: schema.emailTemplates.subject,
          variables: schema.emailTemplates.variables,
          updated_at: schema.emailTemplates.updatedAt,
        })
        .from(schema.emailTemplates),
      db()
        .select({
          campaign_id: schema.emailSends.campaignId,
          status: schema.emailSends.status,
          opened_at: schema.emailSends.openedAt,
          clicked_at: schema.emailSends.clickedAt,
        })
        .from(schema.emailSends)
        .where(isNotNull(schema.emailSends.campaignId)),
    ]);
    const stats: Record<string, { delivered: number; opened: number; clicked: number; bounced: number }> = {};
    for (const s of sends) {
      if (!s.campaign_id) continue;
      const st = (stats[s.campaign_id] ??= { delivered: 0, opened: 0, clicked: 0, bounced: 0 });
      if (s.status === 'delivered' || s.opened_at) st.delivered++;
      if (s.opened_at) st.opened++;
      if (s.clicked_at) st.clicked++;
      if (s.status === 'bounced') st.bounced++;
    }
    return { subscribers: subscribers.length, campaigns, templates, stats };
  });

export const getCampaignReport = createServerFn({ method: 'GET' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data: id }) => {
    const sends = await db()
      .select({
        resend_id: schema.emailSends.resendId,
        status: schema.emailSends.status,
        opened_at: schema.emailSends.openedAt,
        clicked_at: schema.emailSends.clickedAt,
        subscriber_id: schema.emailSends.subscriberId,
      })
      .from(schema.emailSends)
      .where(eq(schema.emailSends.campaignId, id));
    const ids = sends.map((s) => s.resend_id).filter((v): v is string => !!v);
    const clicks = ids.length
      ? await db()
          .select({ url: schema.emailEvents.url })
          .from(schema.emailEvents)
          .where(and(eq(schema.emailEvents.type, 'clicked'), inArray(schema.emailEvents.resendId, ids)))
      : [];
    const links: Record<string, number> = {};
    for (const c of clicks) if (c.url) links[c.url] = (links[c.url] ?? 0) + 1;
    const subscriberIds = sends.map((s) => s.subscriber_id).filter((v): v is string => !!v);
    const subs = subscriberIds.length
      ? await db()
          .select({ id: schema.clubSubscribers.id, status: schema.clubSubscribers.status })
          .from(schema.clubSubscribers)
          .where(inArray(schema.clubSubscribers.id, subscriberIds))
      : [];
    const subStatus = new Map(subs.map((s) => [s.id, s.status]));
    return {
      sent: sends.length,
      delivered: sends.filter((s) => s.status === 'delivered' || s.opened_at).length,
      opened: sends.filter((s) => s.opened_at).length,
      clicked: sends.filter((s) => s.clicked_at).length,
      bounced: sends.filter((s) => s.status === 'bounced').length,
      complained: sends.filter((s) => s.status === 'complained').length,
      unsubscribed: sends.filter((s) => s.subscriber_id && subStatus.get(s.subscriber_id) === 'unsubscribed').length,
      topLinks: Object.entries(links)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([url, count]) => ({ url, count })),
    };
  });

export const getCampaign = createServerFn({ method: 'GET' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data: id }) => {
    const data = await db().query.emailCampaigns.findFirst({
      where: (t, { eq: eqFn }) => eqFn(t.id, id),
    });
    if (!data) throw new Error('That email no longer exists.');
    return {
      draft: toDraft(data, { subject: data.subject, preheader: data.preheader, blocks: [] } as EmailDraft),
      status: data.status,
      scheduledFor: data.scheduledFor,
    };
  });

const saveCampaignSchema = z.object({
  id: idSchema.optional(),
  draft: emailDraftSchema,
  scheduledFor: z.string().datetime().nullable().optional(),
});

async function upsertCampaign(
  staffEmail: string,
  input: z.infer<typeof saveCampaignSchema>,
  status: 'draft' | 'scheduled',
) {
  const row = {
    subject: input.draft.subject,
    preheader: input.draft.preheader,
    blocks: input.draft.blocks as unknown as Json,
    status,
    scheduledFor: status === 'scheduled' ? (input.scheduledFor ?? null) : null,
    sentBy: staffEmail,
    updatedAt: new Date().toISOString(),
  };
  if (input.id) {
    const current = await db().query.emailCampaigns.findFirst({
      where: (t, { eq: eqFn }) => eqFn(t.id, input.id!),
    });
    if (current && current.status !== 'draft' && current.status !== 'scheduled') {
      throw new Error('This email was already sent and can’t be changed.');
    }
    await db().update(schema.emailCampaigns).set(row).where(eq(schema.emailCampaigns.id, input.id));
    return input.id;
  }
  const id = crypto.randomUUID();
  await db().insert(schema.emailCampaigns).values({ id, ...row });
  return id;
}

export const saveCampaign = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => saveCampaignSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (data.scheduledFor && new Date(data.scheduledFor).getTime() <= Date.now()) {
      throw new Error('Pick a time in the future.');
    }
    const id = await upsertCampaign(context.staffEmail, data, data.scheduledFor ? 'scheduled' : 'draft');
    return { id };
  });

export const deleteCampaign = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data: id }) => {
    await db()
      .delete(schema.emailCampaigns)
      .where(and(eq(schema.emailCampaigns.id, id), inArray(schema.emailCampaigns.status, ['draft', 'scheduled'])));
    return { ok: true };
  });

export const sendCampaign = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => saveCampaignSchema.parse(input))
  .handler(async ({ data, context }) => {
    const id = await upsertCampaign(context.staffEmail, { ...data, scheduledFor: null }, 'draft');
    const { siteOrigin } = await import('./club.server');
    const { dispatchCampaign } = await import('./campaigns.server');
    return { id, ...(await dispatchCampaign(id, data.draft, siteOrigin())) };
  });

export const getTemplate = createServerFn({ method: 'GET' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => keySchema.parse(input))
  .handler(async ({ data: key }) => {
    const data = await db().query.emailTemplates.findFirst({
      where: (t, { eq: eqFn }) => eqFn(t.key, key),
    });
    if (!data && key !== WELCOME_KEY) throw new Error('That template no longer exists.');
    return {
      draft: toDraft(data ?? null, defaultWelcome),
      name: data?.name || 'Welcome email',
      kind: data?.kind ?? 'welcome',
      variables: data?.variables ?? [],
    };
  });

export const saveTemplate = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z.object({ key: keySchema, name: z.string().trim().min(1).max(80), draft: emailDraftSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    await db()
      .update(schema.emailTemplates)
      .set({
        name: data.name,
        subject: data.draft.subject,
        preheader: data.draft.preheader,
        blocks: data.draft.blocks as unknown as Json,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.emailTemplates.key, data.key));
    return { ok: true };
  });

export const duplicateTemplate = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => keySchema.parse(input))
  .handler(async ({ data: key }) => {
    const source = await db().query.emailTemplates.findFirst({
      where: (t, { eq: eqFn }) => eqFn(t.key, key),
    });
    if (!source) throw new Error('That template no longer exists.');
    const newKey = `${source.kind === 'welcome' ? 'newsletter' : source.kind}-${Date.now().toString(36)}`;
    await db().insert(schema.emailTemplates).values({
      key: newKey,
      kind: source.kind === 'welcome' ? 'newsletter' : source.kind,
      name: `${source.name || 'Template'} (copy)`,
      subject: source.subject,
      preheader: source.preheader,
      blocks: source.blocks,
      variables: source.variables,
    });
    return { key: newKey };
  });

export const sendTestEmail = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => emailDraftSchema.parse(input))
  .handler(async ({ data, context }) => {
    const to = context.staffEmail;
    const { buildEmail, siteOrigin } = await import('./club.server');
    const { sendOne } = await import('./resend.server');
    try {
      await sendOne(buildEmail({ ...data, subject: `[Test] ${data.subject}` }, to, null, siteOrigin()));
    } catch (error) {
      return { ok: false as const, to, error: error instanceof Error ? error.message : 'Send failed' };
    }
    return { ok: true as const, to };
  });

export const listSubscribers = createServerFn({ method: 'GET' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => z.string().max(100).parse(input))
  .handler(async ({ data: search }) => {
    const term = search.trim().replace(/[%_,()]/g, '');
    const rows = term
      ? await db()
          .select({
            id: schema.clubSubscribers.id,
            email: schema.clubSubscribers.email,
            status: schema.clubSubscribers.status,
            consent_at: schema.clubSubscribers.consentAt,
          })
          .from(schema.clubSubscribers)
          .where(like(schema.clubSubscribers.email, `%${term}%`))
          .orderBy(desc(schema.clubSubscribers.consentAt))
          .limit(200)
      : await db()
          .select({
            id: schema.clubSubscribers.id,
            email: schema.clubSubscribers.email,
            status: schema.clubSubscribers.status,
            consent_at: schema.clubSubscribers.consentAt,
          })
          .from(schema.clubSubscribers)
          .orderBy(desc(schema.clubSubscribers.consentAt))
          .limit(200);
    return rows;
  });

export const removeSubscriber = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data: id }) => {
    await db().delete(schema.clubSubscribers).where(eq(schema.clubSubscribers.id, id));
    return { ok: true };
  });

export const exportSubscribers = createServerFn({ method: 'GET' })
  .middleware([requireStaffSession])
  .handler(async () => {
    const data = await db()
      .select({ email: schema.clubSubscribers.email, consent_at: schema.clubSubscribers.consentAt })
      .from(schema.clubSubscribers)
      .where(eq(schema.clubSubscribers.status, 'active'))
      .orderBy(schema.clubSubscribers.consentAt);
    const rows = data.map((r) => `${r.email},${r.consent_at}`);
    return ['email,joined_at', ...rows].join('\n');
  });

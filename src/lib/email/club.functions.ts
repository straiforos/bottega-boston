import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Json } from '@/integrations/supabase/types';
import { defaultWelcome, emailDraftSchema, WELCOME_KEY, type EmailDraft } from './blocks';

type AuthedSupabase = {
  rpc: (fn: 'has_role', args: { _user_id: string; _role: 'admin' }) => PromiseLike<{ data: unknown; error: unknown }>;
};

async function assertAdmin(supabase: AuthedSupabase, userId: string) {
  const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (error || data !== true) throw new Error('Only Bottega staff can do that.');
}

function toDraft(row: { subject: string; preheader: string; blocks: Json } | null, fallback: EmailDraft): EmailDraft {
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
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: existing } = await supabaseAdmin
      .from('club_subscribers')
      .select('id, unsubscribed_at, status')
      .eq('email', data.email)
      .maybeSingle();
    if (existing && !existing.unsubscribed_at && existing.status === 'active') return { status: 'already' as const };

    const now = new Date().toISOString();
    const { data: row, error } = existing
      ? await supabaseAdmin
          .from('club_subscribers')
          .update({ unsubscribed_at: null, consent_at: now, status: 'active' })
          .eq('id', existing.id)
          .select('id, unsubscribe_token, welcome_sent_at')
          .single()
      : await supabaseAdmin
          .from('club_subscribers')
          .insert({ email: data.email })
          .select('id, unsubscribe_token, welcome_sent_at')
          .single();
    if (error || !row) {
      console.error('Pasta Club signup failed', error);
      throw new Error('Signup failed');
    }

    if (!row.welcome_sent_at) {
      try {
        const { siteOrigin } = await import('./club.server');
        const { sendTemplate } = await import('./campaigns.server');
        await sendTemplate(
          supabaseAdmin,
          { key: WELCOME_KEY, to: data.email, subscriber: { id: row.id, token: row.unsubscribe_token } },
          siteOrigin(),
          defaultWelcome,
        );
        await supabaseAdmin.from('club_subscribers').update({ welcome_sent_at: now }).eq('id', row.id);
      } catch (sendError) {
        console.error('Welcome email failed', sendError);
      }
    }
    return { status: 'joined' as const };
  });

/** Staff workspace: subscriber count, newsletters with stats, templates. */
export const getWorkspace = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase;
    const [{ count }, { data: campaigns }, { data: templates }, { data: sends }] = await Promise.all([
      sb.from('club_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      sb
        .from('email_campaigns')
        .select('id, subject, status, recipient_count, failed_count, sent_at, scheduled_for, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100),
      sb.from('email_templates').select('key, kind, name, subject, variables, updated_at').order('kind'),
      sb.from('email_sends').select('campaign_id, status, opened_at, clicked_at').not('campaign_id', 'is', null),
    ]);
    const stats: Record<string, { delivered: number; opened: number; clicked: number; bounced: number }> = {};
    for (const s of sends ?? []) {
      const k = s.campaign_id as string;
      const st = (stats[k] ??= { delivered: 0, opened: 0, clicked: 0, bounced: 0 });
      if (s.status === 'delivered' || s.opened_at) st.delivered++;
      if (s.opened_at) st.opened++;
      if (s.clicked_at) st.clicked++;
      if (s.status === 'bounced') st.bounced++;
    }
    return { subscribers: count ?? 0, campaigns: campaigns ?? [], templates: templates ?? [], stats };
  });

export const getCampaignReport = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data: id, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase;
    const { data: sends } = await sb
      .from('email_sends')
      .select('resend_id, status, opened_at, clicked_at, club_subscribers(status)')
      .eq('campaign_id', id);
    const ids = (sends ?? []).map((s) => s.resend_id).filter((v): v is string => !!v);
    const { data: clicks } = ids.length
      ? await sb.from('email_events').select('url').eq('type', 'clicked').in('resend_id', ids)
      : { data: [] as { url: string | null }[] };
    const links: Record<string, number> = {};
    for (const c of clicks ?? []) if (c.url) links[c.url] = (links[c.url] ?? 0) + 1;
    const all = sends ?? [];
    const sub = (s: (typeof all)[number]) =>
      (s.club_subscribers as unknown as { status: string } | null)?.status ?? '';
    return {
      sent: all.length,
      delivered: all.filter((s) => s.status === 'delivered' || s.opened_at).length,
      opened: all.filter((s) => s.opened_at).length,
      clicked: all.filter((s) => s.clicked_at).length,
      bounced: all.filter((s) => s.status === 'bounced').length,
      complained: all.filter((s) => s.status === 'complained').length,
      unsubscribed: all.filter((s) => sub(s) === 'unsubscribed').length,
      topLinks: Object.entries(links)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([url, count]) => ({ url, count })),
    };
  });

export const getCampaign = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data: id, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from('email_campaigns')
      .select('subject, preheader, blocks, status, scheduled_for')
      .eq('id', id)
      .maybeSingle();
    if (!data) throw new Error('That email no longer exists.');
    return {
      draft: toDraft(data, { subject: data.subject, preheader: data.preheader, blocks: [] } as EmailDraft),
      status: data.status,
      scheduledFor: data.scheduled_for,
    };
  });

const saveCampaignSchema = z.object({
  id: idSchema.optional(),
  draft: emailDraftSchema,
  scheduledFor: z.string().datetime().nullable().optional(),
});

async function upsertCampaign(
  sb: typeof import('@/integrations/supabase/client.server').supabaseAdmin,
  userId: string,
  input: z.infer<typeof saveCampaignSchema>,
  status: 'draft' | 'scheduled',
) {
  const row = {
    subject: input.draft.subject,
    preheader: input.draft.preheader,
    blocks: input.draft.blocks as unknown as Json,
    status,
    scheduled_for: status === 'scheduled' ? (input.scheduledFor ?? null) : null,
    sent_by: userId,
    updated_at: new Date().toISOString(),
  };
  if (input.id) {
    const { data: current } = await sb.from('email_campaigns').select('status').eq('id', input.id).maybeSingle();
    if (current && current.status !== 'draft' && current.status !== 'scheduled')
      throw new Error('This email was already sent and can’t be changed.');
    const { error } = await sb.from('email_campaigns').update(row).eq('id', input.id);
    if (error) throw new Error('Couldn’t save the email.');
    return input.id;
  }
  const { data, error } = await sb.from('email_campaigns').insert(row).select('id').single();
  if (error || !data) throw new Error('Couldn’t save the email.');
  return data.id;
}

export const saveCampaign = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveCampaignSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase as unknown as Parameters<typeof upsertCampaign>[0];
    if (data.scheduledFor && new Date(data.scheduledFor).getTime() <= Date.now())
      throw new Error('Pick a time in the future.');
    const id = await upsertCampaign(sb, context.userId, data, data.scheduledFor ? 'scheduled' : 'draft');
    return { id };
  });

export const deleteCampaign = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data: id, context }) => {
    await assertAdmin(context.supabase, context.userId);
    await context.supabase.from('email_campaigns').delete().eq('id', id).in('status', ['draft', 'scheduled']);
    return { ok: true };
  });

export const sendCampaign = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveCampaignSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const id = await upsertCampaign(supabaseAdmin, context.userId, { ...data, scheduledFor: null }, 'draft');
    const { siteOrigin } = await import('./club.server');
    const { dispatchCampaign } = await import('./campaigns.server');
    return { id, ...(await dispatchCampaign(supabaseAdmin, id, data.draft, siteOrigin())) };
  });

export const getTemplate = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => keySchema.parse(input))
  .handler(async ({ data: key, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from('email_templates')
      .select('subject, preheader, blocks, name, kind, variables')
      .eq('key', key)
      .maybeSingle();
    if (!data && key !== WELCOME_KEY) throw new Error('That template no longer exists.');
    return {
      draft: toDraft(data, defaultWelcome),
      name: data?.name || 'Welcome email',
      kind: data?.kind ?? 'welcome',
      variables: data?.variables ?? [],
    };
  });

export const saveTemplate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ key: keySchema, name: z.string().trim().min(1).max(80), draft: emailDraftSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from('email_templates')
      .update({
        name: data.name,
        subject: data.draft.subject,
        preheader: data.draft.preheader,
        blocks: data.draft.blocks as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('key', data.key);
    if (error) throw new Error('Couldn’t save the template.');
    return { ok: true };
  });

export const duplicateTemplate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => keySchema.parse(input))
  .handler(async ({ data: key, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: source } = await context.supabase.from('email_templates').select('*').eq('key', key).maybeSingle();
    if (!source) throw new Error('That template no longer exists.');
    const newKey = `${source.kind === 'welcome' ? 'newsletter' : source.kind}-${Date.now().toString(36)}`;
    const { error } = await context.supabase.from('email_templates').insert({
      key: newKey,
      kind: source.kind === 'welcome' ? 'newsletter' : source.kind,
      name: `${source.name || 'Template'} (copy)`,
      subject: source.subject,
      preheader: source.preheader,
      blocks: source.blocks,
      variables: source.variables,
    });
    if (error) throw new Error('Couldn’t copy the template.');
    return { key: newKey };
  });

export const sendTestEmail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => emailDraftSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const to = context.claims.email as string | undefined;
    if (!to) throw new Error('Your account has no email address.');
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
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.string().max(100).parse(input))
  .handler(async ({ data: search, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let query = context.supabase
      .from('club_subscribers')
      .select('id, email, status, consent_at')
      .order('consent_at', { ascending: false })
      .limit(200);
    const term = search.trim().replace(/[%_,()]/g, '');
    if (term) query = query.ilike('email', `%${term}%`);
    const { data } = await query;
    return data ?? [];
  });

export const removeSubscriber = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data: id, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from('club_subscribers').delete().eq('id', id);
    if (error) throw new Error('Couldn’t remove that subscriber.');
    return { ok: true };
  });

export const exportSubscribers = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from('club_subscribers')
      .select('email, consent_at')
      .eq('status', 'active')
      .order('consent_at');
    const rows = (data ?? []).map((r) => `${r.email},${r.consent_at}`);
    return ['email,joined_at', ...rows].join('\n');
  });

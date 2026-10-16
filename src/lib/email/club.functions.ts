import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Json } from '@/integrations/supabase/types';
import { chunk, defaultWelcome, emailDraftSchema, WELCOME_KEY, type EmailDraft } from './blocks';

type AuthedSupabase = { rpc: (fn: 'has_role', args: { _user_id: string; _role: 'admin' }) => PromiseLike<{ data: unknown; error: unknown }> };

async function assertAdmin(supabase: AuthedSupabase, userId: string) {
  const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (error || data !== true) throw new Error('Only Bottega staff can do that.');
}

function toDraft(row: { subject: string; preheader: string; blocks: Json } | null): EmailDraft {
  const parsed = row ? emailDraftSchema.safeParse(row) : null;
  return parsed?.success ? parsed.data : defaultWelcome;
}

/** Public: a guest joins the Pasta Club. Sends the welcome email once. */
export const joinClub = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().trim().toLowerCase().email().max(254), consent: z.literal(true) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: existing } = await supabaseAdmin
      .from('club_subscribers')
      .select('id, unsubscribed_at')
      .eq('email', data.email)
      .maybeSingle();
    if (existing && !existing.unsubscribed_at) return { status: 'already' as const };

    const { data: row, error } = existing
      ? await supabaseAdmin
          .from('club_subscribers')
          .update({ unsubscribed_at: null, consent_at: new Date().toISOString() })
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
        const { buildEmail, siteOrigin } = await import('./club.server');
        const { sendOne } = await import('./resend.server');
        const { data: template } = await supabaseAdmin
          .from('email_templates')
          .select('subject, preheader, blocks')
          .eq('key', WELCOME_KEY)
          .maybeSingle();
        await sendOne(buildEmail(toDraft(template), data.email, row.unsubscribe_token, siteOrigin()));
        await supabaseAdmin.from('club_subscribers').update({ welcome_sent_at: new Date().toISOString() }).eq('id', row.id);
      } catch (sendError) {
        console.error('Welcome email failed', sendError);
      }
    }
    return { status: 'joined' as const };
  });

export const getClubOverview = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { count } = await context.supabase
      .from('club_subscribers')
      .select('id', { count: 'exact', head: true })
      .is('unsubscribed_at', null);
    const { data: campaigns } = await context.supabase
      .from('email_campaigns')
      .select('id, subject, recipient_count, failed_count, sent_at')
      .order('sent_at', { ascending: false })
      .limit(20);
    return { subscribers: count ?? 0, campaigns: campaigns ?? [] };
  });

export const getWelcomeTemplate = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from('email_templates')
      .select('subject, preheader, blocks')
      .eq('key', WELCOME_KEY)
      .maybeSingle();
    return toDraft(data);
  });

export const saveWelcomeTemplate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => emailDraftSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from('email_templates').upsert({
      key: WELCOME_KEY,
      subject: data.subject,
      preheader: data.preheader,
      blocks: data.blocks as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error('Couldn’t save the welcome email.');
    return { ok: true };
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

export const sendCampaign = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => emailDraftSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: subscribers, error } = await context.supabase
      .from('club_subscribers')
      .select('email, unsubscribe_token')
      .is('unsubscribed_at', null);
    if (error) throw new Error('Couldn’t load the subscriber list.');
    const { buildEmail, siteOrigin } = await import('./club.server');
    const { sendBatch } = await import('./resend.server');
    const origin = siteOrigin();
    let sent = 0;
    let failed = 0;
    let lastError: string | null = null;
    for (const group of chunk(subscribers ?? [], 100)) {
      try {
        await sendBatch(group.map((s) => buildEmail(data, s.email, s.unsubscribe_token, origin)));
        sent += group.length;
      } catch (sendError) {
        failed += group.length;
        lastError = sendError instanceof Error ? sendError.message : 'Send failed';
      }
    }
    await context.supabase.from('email_campaigns').insert({
      subject: data.subject,
      preheader: data.preheader,
      blocks: data.blocks as unknown as Json,
      recipient_count: sent,
      failed_count: failed,
      sent_by: context.userId,
    });
    return { sent, failed, error: lastError };
  });

export const exportSubscribers = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from('club_subscribers')
      .select('email, consent_at')
      .is('unsubscribed_at', null)
      .order('consent_at');
    const rows = (data ?? []).map((r) => `${r.email},${r.consent_at}`);
    return ['email,joined_at', ...rows].join('\n');
  });

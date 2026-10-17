import { applyVariables, chunk, emailDraftSchema, type EmailDraft } from './blocks';
import { buildEmail } from './club.server';
import { sendBatch, sendOne } from './resend.server';

type Admin = (typeof import('@/integrations/supabase/client.server'))['supabaseAdmin'];

/** Sends a saved campaign to every active subscriber in batches of 100 and records each send. */
export async function dispatchCampaign(admin: Admin, campaignId: string, draft: EmailDraft, origin: string) {
  await admin.from('email_campaigns').update({ status: 'sending' }).eq('id', campaignId);
  const { data: subscribers, error } = await admin
    .from('club_subscribers')
    .select('id, email, unsubscribe_token')
    .eq('status', 'active')
    .is('unsubscribed_at', null);
  if (error) throw new Error('Couldn’t load the subscriber list.');
  let sent = 0;
  let failed = 0;
  let lastError: string | null = null;
  for (const group of chunk(subscribers ?? [], 100)) {
    try {
      const result = (await sendBatch(group.map((s) => buildEmail(draft, s.email, s.unsubscribe_token, origin)))) as {
        data?: { id: string }[];
      };
      await admin.from('email_sends').insert(
        group.map((s, i) => ({
          campaign_id: campaignId,
          subscriber_id: s.id,
          email: s.email,
          resend_id: result.data?.[i]?.id ?? null,
        })),
      );
      sent += group.length;
    } catch (sendError) {
      failed += group.length;
      lastError = sendError instanceof Error ? sendError.message : 'Send failed';
    }
  }
  await admin
    .from('email_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_count: sent,
      failed_count: failed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId);
  return { sent, failed, error: lastError };
}

/**
 * Sends a saved template to one person, filling {{placeholders}} from `variables`.
 * Ready for future flows such as catering confirmations.
 */
export async function sendTemplate(
  admin: Admin,
  input: { key: string; to: string; variables?: Record<string, string>; subscriber?: { id: string; token: string } },
  origin: string,
  fallback?: EmailDraft,
) {
  const { data } = await admin
    .from('email_templates')
    .select('subject, preheader, blocks')
    .eq('key', input.key)
    .maybeSingle();
  const parsed = data ? emailDraftSchema.safeParse(data) : null;
  const draft = parsed?.success ? parsed.data : fallback;
  if (!draft) throw new Error(`Email template "${input.key}" not found`);
  const filled = applyVariables(draft, input.variables ?? {});
  const result = (await sendOne(buildEmail(filled, input.to, input.subscriber?.token ?? null, origin))) as {
    id?: string;
  };
  await admin.from('email_sends').insert({
    template_key: input.key,
    subscriber_id: input.subscriber?.id ?? null,
    email: input.to,
    resend_id: result.id ?? null,
  });
  return result;
}

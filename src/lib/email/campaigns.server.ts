import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { applyVariables, chunk, emailDraftSchema, type EmailDraft } from './blocks';
import { buildEmail } from './club.server';
import { sendBatch, sendOne } from './resend.server';

/** Sends a saved campaign to every active subscriber in batches of 100 and records each send. */
export async function dispatchCampaign(campaignId: string, draft: EmailDraft, origin: string) {
  await db().update(schema.emailCampaigns).set({ status: 'sending' }).where(eq(schema.emailCampaigns.id, campaignId));
  const subscribers = await db()
    .select({
      id: schema.clubSubscribers.id,
      email: schema.clubSubscribers.email,
      unsubscribeToken: schema.clubSubscribers.unsubscribeToken,
    })
    .from(schema.clubSubscribers)
    .where(eq(schema.clubSubscribers.status, 'active'));
  const active = subscribers.filter(Boolean);
  let sent = 0;
  let failed = 0;
  let lastError: string | null = null;
  for (const group of chunk(active, 100)) {
    try {
      const result = (await sendBatch(
        group.map((s) => buildEmail(draft, s.email, s.unsubscribeToken, origin)),
      )) as { data?: { id: string }[] };
      await db().insert(schema.emailSends).values(
        group.map((s, i) => ({
          id: crypto.randomUUID(),
          campaignId,
          subscriberId: s.id,
          email: s.email,
          resendId: result.data?.[i]?.id ?? null,
        })),
      );
      sent += group.length;
    } catch (sendError) {
      failed += group.length;
      lastError = sendError instanceof Error ? sendError.message : 'Send failed';
    }
  }
  await db()
    .update(schema.emailCampaigns)
    .set({
      status: 'sent',
      sentAt: new Date().toISOString(),
      recipientCount: sent,
      failedCount: failed,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.emailCampaigns.id, campaignId));
  return { sent, failed, error: lastError };
}

/**
 * Sends a saved template to one person, filling {{placeholders}} from `variables`.
 */
export async function sendTemplate(
  input: { key: string; to: string; variables?: Record<string, string>; subscriber?: { id: string; token: string } },
  origin: string,
  fallback?: EmailDraft,
) {
  const data = await db().query.emailTemplates.findFirst({
    where: (t, { eq: eqFn }) => eqFn(t.key, input.key),
  });
  const parsed = data ? emailDraftSchema.safeParse(data) : null;
  const draft = parsed?.success ? parsed.data : fallback;
  if (!draft) throw new Error(`Email template "${input.key}" not found`);
  const filled = applyVariables(draft, input.variables ?? {});
  const result = (await sendOne(buildEmail(filled, input.to, input.subscriber?.token ?? null, origin))) as {
    id?: string;
  };
  await db().insert(schema.emailSends).values({
    id: crypto.randomUUID(),
    templateKey: input.key,
    subscriberId: input.subscriber?.id ?? null,
    email: input.to,
    resendId: result.id ?? null,
  });
  return result;
}

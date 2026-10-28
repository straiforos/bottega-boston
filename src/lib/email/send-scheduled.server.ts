import { and, eq, lte } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import { db, schema } from '@/lib/db';
import { emailDraftSchema } from './blocks';
import { dispatchCampaign } from './campaigns.server';

/** Shared by the HTTP cron route and the Worker scheduled handler. */
export async function runScheduledSends(origin?: string) {
  const site = (origin || env.SITE_ORIGIN || '').replace(/\/+$/, '');
  if (!site) throw new Error('Missing site origin for scheduled email send');

  const now = new Date().toISOString();
  const due = await db()
    .select()
    .from(schema.emailCampaigns)
    .where(and(eq(schema.emailCampaigns.status, 'scheduled'), lte(schema.emailCampaigns.scheduledFor, now)));

  let sent = 0;
  for (const campaign of due) {
    const claimed = await db()
      .update(schema.emailCampaigns)
      .set({ status: 'sending' })
      .where(and(eq(schema.emailCampaigns.id, campaign.id), eq(schema.emailCampaigns.status, 'scheduled')))
      .returning({ id: schema.emailCampaigns.id });
    if (!claimed.length) continue;

    const draft = emailDraftSchema.safeParse({
      subject: campaign.subject,
      preheader: campaign.preheader,
      blocks: campaign.blocks,
    });
    if (!draft.success) {
      await db().update(schema.emailCampaigns).set({ status: 'draft' }).where(eq(schema.emailCampaigns.id, campaign.id));
      continue;
    }
    await dispatchCampaign(campaign.id, draft.data, site);
    sent += 1;
  }
  return { campaigns: sent };
}

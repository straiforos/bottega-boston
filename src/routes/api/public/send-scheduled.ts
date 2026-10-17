import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { emailDraftSchema } from '@/lib/email/blocks';

// Called every few minutes by the scheduler; sends newsletters whose time has come.
export const Route = createFileRoute('/api/public/send-scheduled')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { dispatchCampaign } = await import('@/lib/email/campaigns.server');
        // Claim due campaigns atomically so overlapping runs never send twice.
        const { data: due } = await supabaseAdmin
          .from('email_campaigns')
          .update({ status: 'sending' })
          .eq('status', 'scheduled')
          .lte('scheduled_for', new Date().toISOString())
          .select('id, subject, preheader, blocks');
        const origin = new URL(request.url).origin;
        let sent = 0;
        for (const campaign of due ?? []) {
          const draft = emailDraftSchema.safeParse(campaign);
          if (!draft.success) {
            await supabaseAdmin.from('email_campaigns').update({ status: 'draft' }).eq('id', campaign.id);
            continue;
          }
          await dispatchCampaign(supabaseAdmin, campaign.id, draft.data, origin);
          sent++;
        }
        return Response.json({ campaigns: sent });
      },
    },
  },
});

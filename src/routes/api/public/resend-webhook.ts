import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { eventEffect, verifySvixSignature } from '@/lib/email/webhook';

const payloadSchema = z.object({
  type: z.string().max(60),
  created_at: z.string().optional(),
  data: z.object({
    email_id: z.string().max(100),
    click: z.object({ link: z.string().max(2000) }).optional(),
  }),
});

// Resend reports delivery, opens, clicks, bounces and complaints here (signed with Svix).
export const Route = createFileRoute('/api/public/resend-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env['RESEND_WEBHOOK_SECRET'];
        if (!secret) return new Response('Not configured', { status: 500 });
        const body = await request.text();
        const deliveryId = request.headers.get('svix-id');
        const ok = await verifySvixSignature({
          secret,
          id: deliveryId,
          timestamp: request.headers.get('svix-timestamp'),
          signature: request.headers.get('svix-signature'),
          body,
        });
        if (!ok || !deliveryId) return new Response('Invalid signature', { status: 401 });

        const parsed = payloadSchema.safeParse(JSON.parse(body));
        if (!parsed.success) return new Response('ok');
        const effect = eventEffect(parsed.data.type);
        if (!effect) return new Response('ok');

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const resendId = parsed.data.data.email_id;
        const occurredAt = parsed.data.created_at ?? new Date().toISOString();
        const { error: dup } = await supabaseAdmin.from('email_events').insert({
          delivery_id: deliveryId,
          resend_id: resendId,
          type: effect.event,
          url: parsed.data.data.click?.link ?? null,
          occurred_at: occurredAt,
        });
        if (dup) return new Response('ok'); // already processed this delivery

        const update: Record<string, string> = {};
        if (effect.sendStatus) update.status = effect.sendStatus;
        if (effect.event === 'opened') update.opened_at = occurredAt;
        if (effect.event === 'clicked') update.clicked_at = occurredAt;
        if (Object.keys(update).length) {
          const { data: send } = await supabaseAdmin
            .from('email_sends')
            .update(update)
            .eq('resend_id', resendId)
            .select('subscriber_id')
            .maybeSingle();
          if (effect.subscriberStatus && send?.subscriber_id) {
            await supabaseAdmin
              .from('club_subscribers')
              .update({ status: effect.subscriberStatus })
              .eq('id', send.subscriber_id);
          }
        }
        return new Response('ok');
      },
    },
  },
});

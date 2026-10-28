import { createFileRoute } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { env } from 'cloudflare:workers';
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
        const secret = env.RESEND_WEBHOOK_SECRET;
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

        const { db, schema } = await import('@/lib/db');
        const resendId = parsed.data.data.email_id;
        const occurredAt = parsed.data.created_at ?? new Date().toISOString();
        try {
          await db().insert(schema.emailEvents).values({
            id: crypto.randomUUID(),
            deliveryId,
            resendId,
            type: effect.event,
            url: parsed.data.data.click?.link ?? null,
            occurredAt,
          });
        } catch {
          return new Response('ok'); // already processed this delivery
        }

        const update: { status?: string; openedAt?: string; clickedAt?: string } = {};
        if (effect.sendStatus) update.status = effect.sendStatus;
        if (effect.event === 'opened') update.openedAt = occurredAt;
        if (effect.event === 'clicked') update.clickedAt = occurredAt;
        if (Object.keys(update).length) {
          const updated = await db()
            .update(schema.emailSends)
            .set(update)
            .where(eq(schema.emailSends.resendId, resendId))
            .returning({ subscriberId: schema.emailSends.subscriberId });
          const subscriberId = updated[0]?.subscriberId;
          if (effect.subscriberStatus && subscriberId) {
            await db()
              .update(schema.clubSubscribers)
              .set({ status: effect.subscriberStatus })
              .where(eq(schema.clubSubscribers.id, subscriberId));
          }
        }
        return new Response('ok');
      },
    },
  },
});

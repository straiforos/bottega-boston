import { createFileRoute } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';

const tokenPattern = /^[0-9a-f-]{36}$/i;

async function unsubscribe(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!tokenPattern.test(token)) return false;
  const { db, schema } = await import('@/lib/db');
  const row = await db().query.clubSubscribers.findFirst({
    where: (t, { eq: eqFn }) => eqFn(t.unsubscribeToken, token),
  });
  if (!row || row.unsubscribedAt) return true;
  await db()
    .update(schema.clubSubscribers)
    .set({ unsubscribedAt: new Date().toISOString(), status: 'unsubscribed' })
    .where(eq(schema.clubSubscribers.id, row.id));
  return true;
}

// The unguessable token is the only credential; responses never reveal whether it matched.
export const Route = createFileRoute('/api/public/unsubscribe')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await unsubscribe(request);
        return Response.redirect(new URL('/unsubscribed', request.url).toString(), 303);
      },
      // One-click unsubscribe from mail apps (RFC 8058).
      POST: async ({ request }) => {
        await unsubscribe(request);
        return new Response(null, { status: 200 });
      },
    },
  },
});

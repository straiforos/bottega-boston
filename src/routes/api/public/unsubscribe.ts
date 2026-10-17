import { createFileRoute } from '@tanstack/react-router';

const tokenPattern = /^[0-9a-f-]{36}$/i;

async function unsubscribe(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!tokenPattern.test(token)) return false;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  await supabaseAdmin
    .from('club_subscribers')
    .update({ unsubscribed_at: new Date().toISOString(), status: 'unsubscribed' })
    .eq('unsubscribe_token', token)
    .is('unsubscribed_at', null);
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

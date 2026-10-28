import { createFileRoute } from '@tanstack/react-router';
import { clearSessionCookieHeader } from '@/lib/auth/session';

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const referer = request.headers.get('referer');
        const fallback = new URL('/', request.url).toString();
        const location = referer && new URL(referer).origin === new URL(request.url).origin ? referer : fallback;
        return new Response(null, {
          status: 303,
          headers: {
            Location: location,
            'Set-Cookie': clearSessionCookieHeader(),
          },
        });
      },
      GET: async ({ request }) => {
        return new Response(null, {
          status: 302,
          headers: {
            Location: new URL('/', request.url).toString(),
            'Set-Cookie': clearSessionCookieHeader(),
          },
        });
      },
    },
  },
});

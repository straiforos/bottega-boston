import { createFileRoute } from '@tanstack/react-router';
import { clearSessionCookieHeader } from '@/lib/auth/session';
import { publicOrigin } from '@/lib/auth/public-origin';

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return new Response(null, {
          status: 303,
          headers: {
            Location: `${publicOrigin(new URL(request.url))}/`,
            'Set-Cookie': clearSessionCookieHeader(),
          },
        });
      },
      GET: async ({ request }) => {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${publicOrigin(new URL(request.url))}/`,
            'Set-Cookie': clearSessionCookieHeader(),
          },
        });
      },
    },
  },
});

import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { createOAuthState } from '@/lib/auth/oauth-state';
import { publicOrigin } from '@/lib/auth/public-origin';

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

/** Starts Google OAuth for staff sign-in. */
export const Route = createFileRoute('/api/auth/google')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const returnTo = safeReturnTo(url.searchParams.get('returnTo'));
        const clientId = env.GOOGLE_CLIENT_ID;
        if (!clientId) return new Response('Google sign-in is not configured', { status: 500 });

        const redirectUri = `${publicOrigin(url)}/api/auth/callback`;
        const { state, setCookie } = await createOAuthState(returnTo);
        const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        auth.searchParams.set('client_id', clientId);
        auth.searchParams.set('redirect_uri', redirectUri);
        auth.searchParams.set('response_type', 'code');
        auth.searchParams.set('scope', 'openid email profile');
        auth.searchParams.set('prompt', 'select_account');
        auth.searchParams.set('state', state);
        return new Response(null, {
          status: 302,
          headers: {
            Location: auth.toString(),
            'Set-Cookie': setCookie,
          },
        });
      },
    },
  },
});

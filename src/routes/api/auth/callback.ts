import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { clearOauthNonceCookieHeader, verifyOAuthState } from '@/lib/auth/oauth-state';
import { publicOrigin } from '@/lib/auth/public-origin';
import { isStaffEmail } from '@/lib/auth/staff';
import { sessionCookieHeader, signSession } from '@/lib/auth/session';

/** Exchanges the Google code, checks staff_allowlist, sets the session cookie. */
export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = publicOrigin(url);
        const code = url.searchParams.get('code');
        const returnTo = await verifyOAuthState(url.searchParams.get('state'), request);
        const clearOauth = clearOauthNonceCookieHeader();

        const redirect = (path: string, cookies: string[]) => {
          const headers = new Headers({ Location: `${origin}${path}` });
          for (const cookie of cookies) headers.append('Set-Cookie', cookie);
          return new Response(null, { status: 302, headers });
        };

        const fail = (reason: 'not_listed' | 'failed') => {
          const path = returnTo ?? '/';
          return redirect(`${path}${path.includes('?') ? '&' : '?'}staff_error=${reason}`, [clearOauth]);
        };

        if (!returnTo) return fail('failed');
        if (!code) return fail('failed');
        const clientId = env.GOOGLE_CLIENT_ID;
        const clientSecret = env.GOOGLE_CLIENT_SECRET;
        if (!clientId || !clientSecret) return fail('failed');

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: `${origin}/api/auth/callback`,
            grant_type: 'authorization_code',
          }),
        });
        if (!tokenRes.ok) return fail('failed');
        const tokens = (await tokenRes.json()) as { access_token?: string };
        if (!tokens.access_token) return fail('failed');

        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (!profileRes.ok) return fail('failed');
        const profile = (await profileRes.json()) as { email?: string; verified_email?: boolean };
        const email = profile.email?.toLowerCase();
        if (!email || profile.verified_email === false) return fail('failed');
        if (!(await isStaffEmail(email))) return fail('not_listed');

        const token = await signSession(email);
        return redirect(returnTo, [sessionCookieHeader(token), clearOauth]);
      },
    },
  },
});

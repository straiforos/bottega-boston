import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';

/** Verifies a Cloudflare Turnstile token with the site secret. */
export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token }),
  });
  const out = (await res.json().catch(() => ({}))) as { success?: boolean };
  return out.success === true;
}

/** Public: the Turnstile site key (publishable) for guest forms. */
export const getTurnstileSiteKey = createServerFn({ method: 'GET' }).handler(async () => ({
  siteKey: env.TURNSTILE_SITE_KEY ?? '',
}));

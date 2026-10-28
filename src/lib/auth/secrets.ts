import { env } from 'cloudflare:workers';

/**
 * Secret for signing staff session cookies and OAuth state.
 * Prefer SESSION_SECRET; fall back to GOOGLE_CLIENT_SECRET so existing
 * deploys keep working until the dedicated secret is set.
 */
export function sessionSigningSecret() {
  const value = env.SESSION_SECRET?.trim() || env.GOOGLE_CLIENT_SECRET?.trim();
  if (!value) throw new Error('SESSION_SECRET is not configured');
  return value;
}

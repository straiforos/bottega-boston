import { env } from 'cloudflare:workers';

/**
 * Origin for OAuth redirects and post-login Location headers.
 * Prefer SITE_ORIGIN so we never send Google an http:// callback when the
 * Worker saw the request over plain HTTP (redirect_uri_mismatch).
 */
export function publicOrigin(requestUrl: URL): string {
  const configured = env.SITE_ORIGIN?.replace(/\/+$/, '');
  if (configured) return configured;

  if (requestUrl.protocol === 'http:' && requestUrl.hostname !== 'localhost') {
    return `https://${requestUrl.host}`;
  }
  return requestUrl.origin;
}

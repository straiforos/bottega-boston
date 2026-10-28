import { bufferToBase64Url, hmacSha256, timingSafeEqual, base64UrlToBytes } from './crypto';
import { sessionSigningSecret } from './secrets';

const OAUTH_COOKIE = 'bottega_oauth';
const TTL_SECONDS = 60 * 10;

function safeReturnTo(value: string | undefined | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export function oauthNonceCookieHeader(nonce: string) {
  return `${OAUTH_COOKIE}=${encodeURIComponent(nonce)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_SECONDS}`;
}

export function clearOauthNonceCookieHeader() {
  return `${OAUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readOauthNonce(request: Request) {
  const header = request.headers.get('cookie') ?? '';
  const match = header.match(/(?:^|;\s*)bottega_oauth=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Builds a signed OAuth state and the Set-Cookie that binds it to this browser. */
export async function createOAuthState(returnTo: string) {
  const nonce = crypto.randomUUID();
  const payload = {
    returnTo: safeReturnTo(returnTo),
    nonce,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const body = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(payload)).buffer);
  const signature = await hmacSha256(sessionSigningSecret(), body);
  return {
    state: `${body}.${signature}`,
    setCookie: oauthNonceCookieHeader(nonce),
  };
}

/**
 * Validates signed state + matching oauth nonce cookie.
 * Returns the safe returnTo path, or null when the login must be rejected.
 */
export async function verifyOAuthState(state: string | null, request: Request): Promise<string | null> {
  if (!state) return null;
  const [body, signature] = state.split('.');
  if (!body || !signature) return null;
  const expected = await hmacSha256(sessionSigningSecret(), body);
  if (!timingSafeEqual(expected, signature)) return null;

  const cookieNonce = readOauthNonce(request);
  if (!cookieNonce) return null;

  try {
    const json = new TextDecoder().decode(base64UrlToBytes(body));
    const parsed = JSON.parse(json) as { returnTo?: string; nonce?: string; exp?: number };
    if (typeof parsed.exp !== 'number' || parsed.exp * 1000 < Date.now()) return null;
    if (typeof parsed.nonce !== 'string' || !timingSafeEqual(parsed.nonce, cookieNonce)) return null;
    return safeReturnTo(parsed.returnTo);
  } catch {
    return null;
  }
}

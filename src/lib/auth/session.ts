import { bufferToBase64Url, base64UrlToBytes, hmacSha256, timingSafeEqual } from './crypto';
import { sessionSigningSecret } from './secrets';

const COOKIE = 'bottega_staff';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export interface StaffIdentity {
  email: string;
  exp: number;
}

async function hmac(message: string) {
  return hmacSha256(sessionSigningSecret(), message);
}

export async function signSession(email: string): Promise<string> {
  const payload: StaffIdentity = { email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS };
  const body = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(payload)).buffer);
  const signature = await hmac(body);
  return `${body}.${signature}`;
}

export async function verifySession(token: string | undefined | null): Promise<StaffIdentity | null> {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = await hmac(body);
  if (!timingSafeEqual(expected, signature)) return null;
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(body));
    const payload = JSON.parse(json) as StaffIdentity;
    if (!payload.email || typeof payload.exp !== 'number') return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return { email: payload.email.toLowerCase(), exp: payload.exp };
  } catch {
    return null;
  }
}

export function sessionCookieHeader(token: string) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookieHeader() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readSessionCookie(request: Request) {
  const header = request.headers.get('cookie') ?? '';
  const match = header.match(/(?:^|;\s*)bottega_staff=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export { COOKIE as SESSION_COOKIE_NAME };

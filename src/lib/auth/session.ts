import { env } from 'cloudflare:workers';

const COOKIE = 'bottega_staff';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export interface StaffIdentity {
  email: string;
  exp: number;
}

function secret() {
  const value = env.GOOGLE_CLIENT_SECRET;
  if (!value) throw new Error('GOOGLE_CLIENT_SECRET is not configured');
  return value;
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return bufferToBase64Url(sig);
}

function bufferToBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
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
  if (expected.length !== signature.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  if (mismatch !== 0) return null;
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

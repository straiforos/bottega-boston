/** Resend delivers events signed with Svix. Pure Web Crypto so it runs on the Worker. */
const TOLERANCE_SECONDS = 5 * 60;

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

function bytesToBase64(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifySvixSignature(input: {
  secret: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  body: string;
  nowSeconds?: number;
}) {
  const { secret, id, timestamp, signature, body } = input;
  if (!id || !timestamp || !signature) return false;
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > TOLERANCE_SECONDS) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    base64ToBytes(secret.replace(/^whsec_/, '')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const expected = bytesToBase64(mac);
  return signature
    .split(' ')
    .map((part) => part.split(',')[1] ?? '')
    .some((candidate) => safeEqual(candidate, expected));
}

export type EmailEventType = 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'delayed' | 'sent';

/** What each Resend event changes: the send's status and, for bad addresses, the subscriber's. */
export function eventEffect(type: string): {
  event: EmailEventType;
  sendStatus?: string;
  subscriberStatus?: 'bounced' | 'complained';
} | null {
  switch (type) {
    case 'email.sent':
      return { event: 'sent' };
    case 'email.delivered':
      return { event: 'delivered', sendStatus: 'delivered' };
    case 'email.delivery_delayed':
      return { event: 'delayed' };
    case 'email.opened':
      return { event: 'opened' };
    case 'email.clicked':
      return { event: 'clicked' };
    case 'email.bounced':
      return { event: 'bounced', sendStatus: 'bounced', subscriberStatus: 'bounced' };
    case 'email.complained':
      return { event: 'complained', sendStatus: 'complained', subscriberStatus: 'complained' };
    default:
      return null;
  }
}

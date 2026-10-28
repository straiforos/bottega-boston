import { env } from 'cloudflare:workers';

const RESEND_URL = 'https://api.resend.com';

/** Verified sending domain on Resend (DNS: scripts/setup-resend-domain.mjs). */
export const EMAIL_FROM = 'Bottega Pasta Club <club@bottega.boston>';

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
}

function headers() {
  const resendKey = env.RESEND_API_KEY;
  if (!resendKey) throw new Error('RESEND_API_KEY is not configured');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${resendKey}`,
  };
}

function payload(email: OutgoingEmail) {
  return {
    from: EMAIL_FROM,
    to: [email.to],
    subject: email.subject,
    html: email.html,
    text: email.text,
    headers: {
      'List-Unsubscribe': `<${email.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

async function post(path: string, body: unknown) {
  const response = await fetch(`${RESEND_URL}${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Resend request failed [${response.status}]: ${errorBody}`);
    throw new Error(`Email provider error [${response.status}]: ${errorBody}`);
  }
  return response.json();
}

export function sendOne(email: OutgoingEmail) {
  return post('/emails', payload(email));
}

/** Resend accepts up to 100 emails per batch call. */
export function sendBatch(emails: OutgoingEmail[]) {
  return post('/emails/batch', emails.map(payload));
}

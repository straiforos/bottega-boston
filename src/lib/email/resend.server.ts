const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

/** Sender used until a domain is verified in Resend; change to e.g. "Bottega <ciao@eatbottega.com>" after verifying. */
export const EMAIL_FROM = 'Bottega Pasta Club <onboarding@resend.dev>';

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
}

function headers() {
  const lovableKey = process.env['LOVABLE_API_KEY'];
  const resendKey = process.env['RESEND_API_KEY'];
  if (!lovableKey) throw new Error('LOVABLE_API_KEY is not configured');
  if (!resendKey) throw new Error('RESEND_API_KEY is not configured');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${lovableKey}`,
    'X-Connection-Api-Key': resendKey,
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
  const response = await fetch(`${GATEWAY_URL}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
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

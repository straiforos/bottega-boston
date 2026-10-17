import { getRequest } from '@tanstack/react-start/server';
import { restaurantContent } from '@/content/en/restaurant';
import type { EmailDraft } from './blocks';
import { renderEmail, renderPlainText } from './render-email';
import type { OutgoingEmail } from './resend.server';

/** Inboxes must fetch the logo from a public address; preview and dev origins are private or temporary. */
export const EMAIL_LOGO_URL = 'https://bottega-delights-site.lovable.app/email/bottega-wordmark.png';

export function siteOrigin() {
  return new URL(getRequest().url).origin;
}


export function buildEmail(draft: EmailDraft, to: string, token: string | null, origin: string): OutgoingEmail {
  const unsubscribeUrl = token
    ? `${origin}/api/public/unsubscribe?token=${encodeURIComponent(token)}`
    : `${origin}/unsubscribed`;
  return {
    to,
    subject: draft.subject,
    html: renderEmail(draft, { logoUrl: EMAIL_LOGO_URL, siteUrl: origin, unsubscribeUrl, locations: restaurantContent.addresses }),
    text: renderPlainText(draft, unsubscribeUrl),
    unsubscribeUrl,
  };
}

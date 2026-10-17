import { getRequest } from '@tanstack/react-start/server';
import logoUrl from '@/design-system/bottega-f5161c/bottega/assets/logos/bottega-wordmark.png';
import { restaurantContent } from '@/content/en/restaurant';
import type { EmailDraft } from './blocks';
import { renderEmail, renderPlainText } from './render-email';
import type { OutgoingEmail } from './resend.server';

export function siteOrigin() {
  return new URL(getRequest().url).origin;
}

const address = restaurantContent.addresses.map((a) => `${a.name}, ${a.lines.join(', ')}`).join(' · ');

export function buildEmail(draft: EmailDraft, to: string, token: string | null, origin: string): OutgoingEmail {
  const unsubscribeUrl = token
    ? `${origin}/api/public/unsubscribe?token=${encodeURIComponent(token)}`
    : `${origin}/unsubscribed`;
  const absoluteLogo = logoUrl.startsWith('http') ? logoUrl : `${origin}${logoUrl}`;
  return {
    to,
    subject: draft.subject,
    html: renderEmail(draft, { logoUrl: absoluteLogo, siteUrl: origin, unsubscribeUrl, address }),
    text: renderPlainText(draft, unsubscribeUrl),
    unsubscribeUrl,
  };
}

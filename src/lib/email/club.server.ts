import { getRequest } from '@tanstack/react-start/server';
import { restaurantContent } from '@/content/en/restaurant';
import type { EmailDraft } from './blocks';
import { renderEmail, renderPlainText } from './render-email';
import type { OutgoingEmail } from './resend.server';

/** Relative path; absolute URL is built from the request host at send time. */
export const EMAIL_LOGO_PATH = '/email/bottega-wordmark.png';

export function siteOrigin() {
  return new URL(getRequest().url).origin;
}

/** Turn relative in-site paths into absolute URLs for the mail client. */
export function absoluteUrl(origin: string, url: string) {
  if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
  if (url.startsWith('/')) return `${origin.replace(/\/+$/, '')}${url}`;
  return url;
}

export function absolutizeDraft(draft: EmailDraft, origin: string): EmailDraft {
  return {
    ...draft,
    blocks: draft.blocks.map((block) => {
      if (block.type === 'button') return { ...block, url: absoluteUrl(origin, block.url) };
      if (block.type === 'photo') return { ...block, url: absoluteUrl(origin, block.url) };
      if (block.type === 'columns') {
        return {
          ...block,
          left: { ...block.left, url: absoluteUrl(origin, block.left.url) },
          right: { ...block.right, url: absoluteUrl(origin, block.right.url) },
        };
      }
      return block;
    }),
  };
}

export function buildEmail(draft: EmailDraft, to: string, token: string | null, origin: string): OutgoingEmail {
  const unsubscribeUrl = token
    ? `${origin}/api/public/unsubscribe?token=${encodeURIComponent(token)}`
    : `${origin}/unsubscribed`;
  const absolute = absolutizeDraft(draft, origin);
  return {
    to,
    subject: absolute.subject,
    html: renderEmail(absolute, {
      logoUrl: absoluteUrl(origin, EMAIL_LOGO_PATH),
      siteUrl: origin,
      unsubscribeUrl,
      locations: restaurantContent.addresses,
    }),
    text: renderPlainText(absolute, unsubscribeUrl),
    unsubscribeUrl,
  };
}

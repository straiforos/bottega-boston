import type { EmailBlock, EmailDraft } from '@/lib/email/blocks';
import type { BottegaEvent } from './events-api';

const SITE = 'https://bottega-delights-site.lovable.app';

/** Pure: a ready-to-edit Pasta Club newsletter announcing an event. */
export function buildEventNewsletter(event: BottegaEvent, dates: readonly string[], repeats: string | null): EmailDraft {
  const blocks: EmailBlock[] = [{ id: 'e1', type: 'headline', text: event.title }];
  if (event.imageUrl) blocks.push({ id: 'e2', type: 'photo', url: event.imageUrl, alt: event.title });
  const when = repeats ? `**${repeats}** — next: ${dates.join(', ')}` : `**${dates[0] ?? ''}**`;
  blocks.push({ id: 'e3', type: 'text', text: [when, event.description].filter(Boolean).join('\n\n') });
  blocks.push({
    id: 'e4',
    type: 'button',
    label: event.ticketUrl ? 'Get tickets' : 'See our events',
    url: event.ticketUrl ?? `${SITE}/#events`,
  });
  blocks.push({ id: 'e5', type: 'marquee', text: 'Come hang out with us' });
  return { subject: event.title.slice(0, 150), preheader: (repeats ?? dates[0] ?? '').slice(0, 200), blocks };
}

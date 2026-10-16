import { z } from 'zod';

/** Building blocks staff compose emails from. Text uses **bold**, _italic_ and [label](https://link). */
export const emailBlockSchema = z.discriminatedUnion('type', [
  z.object({ id: z.string().max(40), type: z.literal('headline'), text: z.string().max(140) }),
  z.object({ id: z.string().max(40), type: z.literal('text'), text: z.string().max(5000) }),
  z.object({
    id: z.string().max(40),
    type: z.literal('photo'),
    url: z.string().url().max(2000),
    alt: z.string().max(200),
  }),
  z.object({
    id: z.string().max(40),
    type: z.literal('button'),
    label: z.string().max(60),
    url: z.string().max(2000),
  }),
  z.object({ id: z.string().max(40), type: z.literal('marquee'), text: z.string().max(80) }),
]);

export type EmailBlock = z.infer<typeof emailBlockSchema>;
export type EmailBlockType = EmailBlock['type'];

export const emailDraftSchema = z.object({
  subject: z.string().trim().min(1, 'Add a subject line.').max(150),
  preheader: z.string().max(200),
  blocks: z.array(emailBlockSchema).min(1, 'Add at least one block.').max(40),
});

export type EmailDraft = z.infer<typeof emailDraftSchema>;

export function isSafeLink(url: string) {
  return /^(https?:\/\/|mailto:)/i.test(url.trim());
}

/** First problem staff should fix before sending, or null. */
export function validateDraft(draft: EmailDraft): string | null {
  const parsed = emailDraftSchema.safeParse(draft);
  if (!parsed.success) return parsed.error.issues[0]?.message ?? 'Check the email and try again.';
  for (const block of draft.blocks) {
    if (block.type === 'button' && (!block.label.trim() || !isSafeLink(block.url)))
      return 'Every button needs a label and a link starting with https://';
    if (block.type === 'photo' && !block.alt.trim()) return 'Describe every photo for people using screen readers.';
  }
  return null;
}

export function newBlock(type: EmailBlockType): EmailBlock {
  const id = `b-${Math.random().toString(36).slice(2, 10)}`;
  switch (type) {
    case 'headline':
      return { id, type, text: 'Big news from Bottega' };
    case 'text':
      return { id, type, text: 'Write your message here.' };
    case 'photo':
      return { id, type, url: 'https://example.com/photo.jpg', alt: '' };
    case 'button':
      return { id, type, label: 'Order now', url: 'https://' };
    case 'marquee':
      return { id, type, text: 'Pasta is life' };
  }
}

export function moveBlock(blocks: readonly EmailBlock[], id: string, direction: -1 | 1): EmailBlock[] {
  const index = blocks.findIndex((b) => b.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= blocks.length) return [...blocks];
  const next = [...blocks];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const WELCOME_KEY = 'welcome';

export const defaultWelcome: EmailDraft = {
  subject: 'Benvenuti to the Bottega Pasta Club!',
  preheader: 'Good pasta. Good people. Good news.',
  blocks: [
    { id: 'w1', type: 'headline', text: 'Welcome to the Pasta Club' },
    {
      id: 'w2',
      type: 'text',
      text: 'Grazie for joining! You’re now first in line for **events**, **menu launches** and _special offers_ from Bottega.\n\nJudgment-free and full of carbs — that’s a promise.',
    },
    { id: 'w3', type: 'marquee', text: 'Pasta is life' },
    { id: 'w4', type: 'button', label: 'Order now', url: 'https://ciao724.wixstudio.com/my-site/online-ordering' },
    { id: 'w5', type: 'text', text: 'See you at the table,\nThe Bottega family' },
  ],
};

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

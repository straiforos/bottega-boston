import { z } from 'zod';

/** Where "Order now" buttons point by default. Relative; send path prefixes the request host. */
export const ORDER_NOW_URL = '/#locations';

export function isSafeLink(url: string) {
  const value = url.trim();
  return /^(https?:\/\/|mailto:)/i.test(value) || /^\/(?!\/)/.test(value);
}

/** Building blocks staff compose emails from. Text uses **bold**, _italic_ and [label](https://link). */
const photoUrl = z
  .string()
  .max(2000)
  .refine((value) => isSafeLink(value), 'Photo needs a / or https:// link');
const photoFields = { url: photoUrl, alt: z.string().max(200) };

export const emailBlockSchema = z.discriminatedUnion('type', [
  z.object({ id: z.string().max(40), type: z.literal('headline'), text: z.string().max(140) }),
  z.object({ id: z.string().max(40), type: z.literal('text'), text: z.string().max(5000) }),
  z.object({ id: z.string().max(40), type: z.literal('photo'), ...photoFields }),
  z.object({
    id: z.string().max(40),
    type: z.literal('columns'),
    left: z.object(photoFields),
    right: z.object(photoFields),
  }),
  z.object({
    id: z.string().max(40),
    type: z.literal('button'),
    label: z.string().max(60),
    url: z.string().max(2000),
  }),
  z.object({ id: z.string().max(40), type: z.literal('marquee'), text: z.string().max(80) }),
  z.object({ id: z.string().max(40), type: z.literal('divider') }),
  z.object({ id: z.string().max(40), type: z.literal('spacer') }),
]);

export type EmailBlock = z.infer<typeof emailBlockSchema>;
export type EmailBlockType = EmailBlock['type'];
export const BLOCK_TYPES: EmailBlockType[] = [
  'headline',
  'text',
  'photo',
  'columns',
  'button',
  'marquee',
  'divider',
  'spacer',
];

export const emailDraftSchema = z.object({
  subject: z.string().trim().min(1, 'Add a subject line.').max(150),
  preheader: z.string().max(200),
  blocks: z.array(emailBlockSchema).min(1, 'Add at least one block.').max(40),
});

export type EmailDraft = z.infer<typeof emailDraftSchema>;

const PLACEHOLDER_PHOTO = 'https://example.com/photo.jpg';
export const isPlaceholderPhoto = (url: string) => url === PLACEHOLDER_PHOTO;

/** First problem staff should fix before sending, or null. */
export function validateDraft(draft: EmailDraft): string | null {
  const parsed = emailDraftSchema.safeParse(draft);
  if (!parsed.success) return parsed.error.issues[0]?.message ?? 'Check the email and try again.';
  for (const block of draft.blocks) {
    if (block.type === 'button' && (!block.label.trim() || !isSafeLink(block.url)))
      return 'Every button needs a label and a link starting with / or https://';
    const photos = block.type === 'photo' ? [block] : block.type === 'columns' ? [block.left, block.right] : [];
    for (const photo of photos) {
      if (isPlaceholderPhoto(photo.url)) return 'Choose a picture for every photo block.';
      if (!photo.alt.trim()) return 'Describe every photo for people using screen readers.';
    }
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
      return { id, type, url: PLACEHOLDER_PHOTO, alt: '' };
    case 'columns':
      return { id, type, left: { url: PLACEHOLDER_PHOTO, alt: '' }, right: { url: PLACEHOLDER_PHOTO, alt: '' } };
    case 'button':
      return { id, type, label: 'Order now', url: ORDER_NOW_URL };
    case 'marquee':
      return { id, type, text: 'Pasta is life' };
    case 'divider':
    case 'spacer':
      return { id, type };
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

export function insertBlockAt(blocks: readonly EmailBlock[], index: number, block: EmailBlock): EmailBlock[] {
  const at = Math.max(0, Math.min(index, blocks.length));
  return [...blocks.slice(0, at), block, ...blocks.slice(at)];
}

export function removeBlock(blocks: readonly EmailBlock[], id: string): EmailBlock[] {
  return blocks.filter((b) => b.id !== id);
}

/** Copies a block right after itself with a fresh id; returns the list and the copy's id. */
export function duplicateBlock(blocks: readonly EmailBlock[], id: string): { blocks: EmailBlock[]; id: string | null } {
  const index = blocks.findIndex((b) => b.id === id);
  if (index < 0) return { blocks: [...blocks], id: null };
  const copy = { ...structuredClone(blocks[index]), id: newBlock(blocks[index].type).id } as EmailBlock;
  return { blocks: insertBlockAt(blocks, index + 1, copy), id: copy.id };
}

/** The block above/below the selection (clamped); first block when nothing is selected. */
export function selectNeighbor(blocks: readonly EmailBlock[], id: string | null, direction: -1 | 1): string | null {
  if (!blocks.length) return null;
  const index = blocks.findIndex((b) => b.id === id);
  if (index < 0) return blocks[direction === 1 ? 0 : blocks.length - 1].id;
  return blocks[Math.max(0, Math.min(blocks.length - 1, index + direction))].id;
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
      text: 'Grazie for joining! You’re now first in line for **events**, **menu launches** and _special offers_ from Bottega.\n\nJudgment-free and full of carbs. That’s a promise.',
    },
    { id: 'w3', type: 'marquee', text: 'Pasta is life' },
    { id: 'w4', type: 'button', label: 'Order now', url: ORDER_NOW_URL },
    { id: 'w5', type: 'text', text: 'See you at the table,\nThe Bottega family' },
  ],
};

/** Fills {{name}} placeholders with the given values; unknown placeholders are left as typed. */
export function applyVariables(draft: EmailDraft, values: Record<string, string>): EmailDraft {
  const fill = (s: string) =>
    s.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, key: string) => (key in values ? values[key] : match));
  const blocks = draft.blocks.map((b) => {
    switch (b.type) {
      case 'headline':
      case 'text':
      case 'marquee':
        return { ...b, text: fill(b.text) };
      case 'button':
        return { ...b, label: fill(b.label) };
      default:
        return b;
    }
  });
  return { subject: fill(draft.subject), preheader: fill(draft.preheader), blocks };
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

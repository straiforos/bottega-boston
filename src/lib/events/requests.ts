import { z } from 'zod';

/** Shared (browser + server) rules for guest catering and event-space requests. */

export const REQUEST_STATUSES = ['new', 'quoted', 'booked', 'declined'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestKind = 'catering' | 'space';

export interface PriceOption {
  readonly label: string;
  readonly amount: number | null;
}

/** "Mini $3.25 | Traditional $5.25" → two options; "$140.00" → one unlabeled option. */
export function parsePriceOptions(price: string): PriceOption[] {
  const parts = price.split('|').map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return [{ label: '', amount: null }];
  return parts.map((part) => {
    const match = part.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
    const amount = match ? Number(match[1]) : null;
    const label = part.replace(/\$?\s*\d+(?:\.\d{1,2})?/, '').trim();
    return { label, amount };
  });
}

export const orderLineSchema = z.object({
  itemId: z.string().min(1).max(80),
  option: z.string().max(60).default(''),
  quantity: z.number().int().min(1).max(50),
});
export type OrderLineInput = z.infer<typeof orderLineSchema>;

export interface OrderLine extends OrderLineInput {
  readonly name: string;
  readonly unitPrice: number | null;
}

/** Estimated total; lines without a parseable price are left out. */
export function orderTotal(lines: readonly OrderLine[]) {
  return Math.round(lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.quantity, 0) * 100) / 100;
}

/** Re-prices guest lines from the real catering menu; unknown items or options are rejected. */
export function priceOrder(
  lines: readonly OrderLineInput[],
  catalog: ReadonlyMap<string, { name: string; price: string }>,
): OrderLine[] {
  return lines.map((line) => {
    const item = catalog.get(line.itemId);
    if (!item) throw new Error('One of the items isn’t on the catering menu.');
    const options = parsePriceOptions(item.price);
    const chosen = options.find((o) => o.label === line.option) ?? (options.length === 1 ? options[0] : undefined);
    if (!chosen) throw new Error(`Pick a size for ${item.name}.`);
    return { ...line, option: chosen.label, name: item.name, unitPrice: chosen.amount };
  });
}

const text = (max: number) => z.string().trim().max(max);

export const requestSchema = z
  .object({
    kind: z.enum(['catering', 'space']),
    name: text(100).min(1, 'Add your name.'),
    email: z.string().trim().toLowerCase().email('Add a valid email.').max(254),
    phone: text(40).min(7, 'Add a phone number.'),
    locationId: z.enum(['brookline', 'boston']),
    requestedFor: z.string().datetime({ offset: true, message: 'Pick a date and time.' }),
    guests: z.number().int().min(1).max(500).nullable(),
    eventType: text(100),
    fulfillment: z.enum(['pickup', 'delivery', '']),
    address: text(300),
    dietary: text(500),
    notes: text(2000),
    lines: z.array(orderLineSchema).max(40),
    website: z.string().max(0).optional(), // honeypot
  })
  .superRefine((r, ctx) => {
    if (new Date(r.requestedFor).getTime() < Date.now()) ctx.addIssue({ code: 'custom', path: ['requestedFor'], message: 'Pick a future date.' });
    if (r.kind === 'catering' && r.lines.length === 0) ctx.addIssue({ code: 'custom', path: ['lines'], message: 'Add at least one tray.' });
    if (r.kind === 'catering' && !r.fulfillment) ctx.addIssue({ code: 'custom', path: ['fulfillment'], message: 'Choose pickup or delivery.' });
    if (r.fulfillment === 'delivery' && !r.address) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Add the delivery address.' });
    if (r.kind === 'space' && !r.guests) ctx.addIssue({ code: 'custom', path: ['guests'], message: 'How many guests?' });
  });
export type RequestInput = z.infer<typeof requestSchema>;

/** Strips characters that would turn guest text into email formatting or links. */
export const plainForEmail = (s: string) => s.replace(/[[\]()*_{}<>]/g, '').trim();

export const formatMoney = (n: number) => `$${n.toFixed(2)}`;

export function describeLines(lines: readonly OrderLine[]) {
  return lines
    .map((l) => `${l.quantity} × ${l.name}${l.option ? ` (${l.option})` : ''}${l.unitPrice != null ? ` — ${formatMoney(l.unitPrice * l.quantity)}` : ''}`)
    .join('\n');
}

/** Ticket Tailor checkout links: secure and on tickettailor.com. */
export function isTicketTailorUrl(url: string) {
  try {
    const u = new URL(url.trim());
    return u.protocol === 'https:' && (u.hostname === 'tickettailor.com' || u.hostname.endsWith('.tickettailor.com'));
  } catch {
    return false;
  }
}

/** Embeddable checkout URL for a Ticket Tailor event or box office link. */
export function ticketEmbedUrl(url: string) {
  const u = new URL(url.trim());
  u.searchParams.set('modal_widget', 'true');
  return u.toString();
}

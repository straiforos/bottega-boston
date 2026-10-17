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

/** Requests may be booked at most two years ahead. */
export const REQUEST_MAX_LEAD_MS = 2 * 366 * 24 * 60 * 60 * 1000; // leap-inclusive two years

const p2 = (n: number) => String(n).padStart(2, '0');
const localDateTimeValue = (d: Date) =>
  `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;

/** Date-picker bounds for guest requests: from the next minute up to two years out. */
export function requestDateBounds(now: Date = new Date()): { min: string; max: string } {
  const max = new Date(now);
  max.setFullYear(max.getFullYear() + 2);
  return { min: localDateTimeValue(new Date(now.getTime() + 60_000)), max: localDateTimeValue(max) };
}

/** US phone mask while typing: "(617) 555-1234", optional " x123" extension, no trailing separators. */
export function maskPhone(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1); // pasted +1 country code
  const ten = digits.slice(0, 10);
  const ext = digits.slice(10, 15);
  const a = ten.slice(0, 3);
  const b = ten.slice(3, 6);
  const c = ten.slice(6, 10);
  let out = a ? `(${a}` : '';
  if (a.length === 3 && (b || c)) out += ') ';
  out += b;
  if (b.length === 3 && c) out += '-';
  out += c;
  if (ext) out += ` x${ext}`;
  return out;
}

const phoneMask = text(40).refine((v) => v.replace(/\D/g, '').length >= 7, 'Add a phone number.');

export const requestSchema = z
  .object({
    kind: z.enum(['catering', 'space']),
    name: text(100).min(1, 'Add your name.'),
    email: z.string().trim().toLowerCase().email('Add a valid email.').max(254),
    phone: phoneMask,
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
    turnstileToken: z.string().max(4096).optional(),
  })
  .superRefine((r, ctx) => {
    const requested = new Date(r.requestedFor).getTime();
    if (requested < Date.now()) ctx.addIssue({ code: 'custom', path: ['requestedFor'], message: 'Pick a future date.' });
    if (requested > Date.now() + REQUEST_MAX_LEAD_MS) ctx.addIssue({ code: 'custom', path: ['requestedFor'], message: 'Pick a date within the next two years.' });
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

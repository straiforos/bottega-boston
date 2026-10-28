import { orderLocations } from '@/content/links';

export const ORDER_LOCATIONS_KEY = 'order_locations';
export type OrderUrls = Record<string, string>;

export const defaultOrderUrls: OrderUrls = Object.fromEntries(orderLocations.map((l) => [l.id, l.orderUrl]));

/** Ordering links must be secure web addresses. */
export function isValidOrderUrl(url: string) {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

/** Pure: stored URLs override defaults only for known locations with valid addresses. */
export function mergeOrderUrls(raw: unknown): OrderUrls {
  const out = { ...defaultOrderUrls };
  if (typeof raw !== 'object' || raw === null) return out;
  for (const id of Object.keys(out)) {
    const value = (raw as Record<string, unknown>)[id];
    if (typeof value === 'string' && isValidOrderUrl(value)) out[id] = value.trim();
  }
  return out;
}

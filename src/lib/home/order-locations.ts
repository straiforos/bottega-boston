import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { orderLocations } from '@/content/links';
import { saveHomeContent } from './home-content';

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

export const orderUrlsQueryOptions = queryOptions({
  queryKey: ['home-content', ORDER_LOCATIONS_KEY],
  queryFn: async () => {
    const { data, error } = await supabase.from('home_content').select('data').eq('key', ORDER_LOCATIONS_KEY).maybeSingle();
    if (error) throw error;
    return mergeOrderUrls(data?.data);
  },
});

export const saveOrderUrls = (urls: OrderUrls) => saveHomeContent(ORDER_LOCATIONS_KEY, urls);

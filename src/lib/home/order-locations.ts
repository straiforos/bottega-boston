import { queryOptions } from '@tanstack/react-query';
import { fetchHomeContentKey } from './home.functions';
import { saveHomeContent } from './home-content';
import {
  ORDER_LOCATIONS_KEY,
  defaultOrderUrls,
  isValidOrderUrl,
  mergeOrderUrls,
  type OrderUrls,
} from './order-locations-shared';

export { ORDER_LOCATIONS_KEY, defaultOrderUrls, isValidOrderUrl, mergeOrderUrls, type OrderUrls };

export const orderUrlsQueryOptions = queryOptions({
  queryKey: ['home-content', ORDER_LOCATIONS_KEY],
  queryFn: async () => mergeOrderUrls(await fetchHomeContentKey({ data: ORDER_LOCATIONS_KEY })),
});

export const saveOrderUrls = (urls: OrderUrls) => saveHomeContent(ORDER_LOCATIONS_KEY, urls);

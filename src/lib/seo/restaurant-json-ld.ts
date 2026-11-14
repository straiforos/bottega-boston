import { links, orderLocations } from '@/content/links';
import { restaurantContent } from '@/content/en/restaurant';
import { defaultHomeContent } from '@/lib/home/home-shared';
import { absoluteUrl } from './absolute-url';

type Location = (typeof orderLocations)[number];
type OrderUrlMap = Partial<Record<Location['id'], string>>;

const HOURS_BY_LABEL: Record<string, string[]> = {
  'Monday to Friday': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  Weekends: ['Saturday', 'Sunday'],
};

/** Schema.org Restaurant graph for both shops (NAP, hours, geo, OrderAction). */
export function buildRestaurantJsonLd(
  orderUrls: OrderUrlMap = {},
  imageUrl: string = defaultHomeContent.hero.imageUrl,
) {
  const image = absoluteUrl(imageUrl);
  const graph = orderLocations.map((location) =>
    restaurantNode(location, orderUrls[location.id], image),
  );
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

function restaurantNode(location: Location, orderUrl: string | undefined, image: string) {
  const { streetAddress, addressLocality, addressRegion, postalCode } = parseAddress(location);
  return {
    '@type': 'Restaurant',
    '@id': absoluteUrl(`/order#${location.id}`),
    name: location.name,
    url: absoluteUrl('/order'),
    servesCuisine: 'Italian',
    telephone: links.phone,
    email: links.email,
    image,
    sameAs: [links.instagram, links.facebook],
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
    },
    openingHoursSpecification: openingHours(),
    potentialAction: {
      '@type': 'OrderAction',
      target: orderUrl ?? location.orderUrl,
    },
  };
}

function parseAddress(location: Location) {
  const streetAddress = location.lines[0] ?? '';
  const cityLine = location.lines[1] ?? '';
  const match = cityLine.match(/^(.+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  return {
    streetAddress,
    addressLocality: match?.[1] ?? location.area,
    addressRegion: match?.[2] ?? 'MA',
    postalCode: match?.[3] ?? '',
  };
}

function openingHours() {
  return restaurantContent.hours.flatMap((row) => {
    const days = HOURS_BY_LABEL[row.label];
    const times = parseClockRange(row.value);
    if (!days || !times) return [];
    return days.map((dayOfWeek) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek,
      opens: times.opens,
      closes: times.closes,
    }));
  });
}

/** "7:30 am – 9:00 pm" → 24h opens/closes for schema.org. */
export function parseClockRange(value: string): { opens: string; closes: string } | null {
  const match = value.match(
    /(\d{1,2}):(\d{2})\s*(am|pm)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(am|pm)/i,
  );
  if (!match) return null;
  return {
    opens: to24h(Number(match[1]), Number(match[2]), match[3]),
    closes: to24h(Number(match[4]), Number(match[5]), match[6]),
  };
}

function to24h(hour: number, minute: number, meridiem: string): string {
  let h = hour % 12;
  if (/pm/i.test(meridiem)) h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

import { describe, expect, it } from 'vitest';
import { links, orderLocations } from '@/content/links';
import { buildRestaurantJsonLd, parseClockRange } from './restaurant-json-ld';

describe('restaurant JSON-LD', () => {
  it('emits a graph with both shops, NAP, geo, hours, and OrderAction', () => {
    const data = buildRestaurantJsonLd({
      brookline: 'https://example.com/brookline',
      boston: 'https://example.com/boston',
    });

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph']).toHaveLength(2);

    for (const [index, location] of orderLocations.entries()) {
      const node = data['@graph'][index] as Record<string, unknown>;
      expect(node['@type']).toBe('Restaurant');
      expect(node.name).toBe(location.name);
      expect(node.telephone).toBe(links.phone);
      expect(node.email).toBe(links.email);
      expect(node.image).toContain('/media/');
      expect(node.sameAs).toEqual([links.instagram, links.facebook]);

      const address = node.address as Record<string, string>;
      expect(address.streetAddress).toBe(location.lines[0]);
      expect(address.addressRegion).toBe('MA');
      expect(address.postalCode).toMatch(/^\d{5}/);

      const geo = node.geo as Record<string, number>;
      expect(geo.latitude).toBe(location.coordinates.lat);
      expect(geo.longitude).toBe(location.coordinates.lng);

      const hours = node.openingHoursSpecification as unknown[];
      expect(hours.length).toBeGreaterThanOrEqual(7);

      const action = node.potentialAction as Record<string, string>;
      expect(action['@type']).toBe('OrderAction');
      expect(action.target).toContain('example.com');
    }
  });

  it('parses restaurant hour copy into 24h opens/closes', () => {
    expect(parseClockRange('7:30 am – 9:00 pm')).toEqual({ opens: '07:30', closes: '21:00' });
    expect(parseClockRange('9:30 am – 9:00 pm')).toEqual({ opens: '09:30', closes: '21:00' });
  });
});

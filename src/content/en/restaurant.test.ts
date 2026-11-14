import { describe, expect, it } from 'vitest';
import { restaurantContent } from './restaurant';

describe('route metadata', () => {
  it('covers every indexable guest route', () => {
    expect(Object.keys(restaurantContent.metadata).sort()).toEqual(
      ['catering', 'eventsRequest', 'home', 'menu', 'order'].sort(),
    );
  });

  it('keeps route titles and descriptions distinct', () => {
    const titles = Object.values(restaurantContent.metadata).map((m) => m.title);
    const descriptions = Object.values(restaurantContent.metadata).map((m) => m.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('provides complete social text', () => {
    for (const metadata of Object.values(restaurantContent.metadata)) {
      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      expect(metadata.socialDescription).toBeTruthy();
    }
  });
});

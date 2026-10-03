import { describe, expect, it } from 'vitest';
import { restaurantContent } from './restaurant';

describe('route metadata', () => {
  it('keeps route titles and descriptions distinct', () => {
    expect(restaurantContent.metadata.home.title).not.toBe(restaurantContent.metadata.menu.title);
    expect(restaurantContent.metadata.home.description).not.toBe(restaurantContent.metadata.menu.description);
  });

  it('provides complete social text', () => {
    for (const metadata of Object.values(restaurantContent.metadata)) {
      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      expect(metadata.socialDescription).toBeTruthy();
    }
  });
});
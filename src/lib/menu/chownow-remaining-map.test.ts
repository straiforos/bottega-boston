import { describe, expect, it } from 'vitest';
import { menuSections } from '@/lib/menu-data';
import { CHOWNOW_REMAINING_MAP, remainingPresentationHint } from './chownow-remaining-map';

describe('CHOWNOW_REMAINING_MAP', () => {
  const byId = new Map(
    menuSections.flatMap((section) => section.items.map((item) => [item.id, item] as const)),
  );

  it('targets known menu dishes with presentation hints', () => {
    expect(Object.keys(CHOWNOW_REMAINING_MAP).length).toBeGreaterThanOrEqual(20);
    for (const [dishId, spec] of Object.entries(CHOWNOW_REMAINING_MAP)) {
      expect(byId.has(dishId), dishId).toBe(true);
      expect(spec.chowNowName.length).toBeGreaterThan(2);
      expect(remainingPresentationHint(spec.presentation).length).toBeGreaterThan(10);
    }
  });
});

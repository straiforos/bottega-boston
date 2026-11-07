import { describe, expect, it } from 'vitest';
import { menuSections } from '@/lib/menu-data';
import { CHOWNOW_PHOTO_MAP } from './chownow-photo-map';
import {
  CHOWNOW_CATERING_REUSE_MAP,
  cateringPresentationHint,
} from './chownow-catering-reuse-map';

describe('CHOWNOW_CATERING_REUSE_MAP', () => {
  const byId = new Map(
    menuSections.flatMap((section) =>
      section.items.map((item) => [item.id, { ...item, sectionName: section.name }] as const),
    ),
  );

  it('maps each catering target to a polished dining or prior catering source', () => {
    expect(Object.keys(CHOWNOW_CATERING_REUSE_MAP).length).toBe(29);
    for (const [cateringId, spec] of Object.entries(CHOWNOW_CATERING_REUSE_MAP)) {
      const catering = byId.get(cateringId);
      const source = byId.get(spec.sourceDishId);
      expect(catering?.sectionName.startsWith('Catering'), cateringId).toBe(true);
      expect(source, spec.sourceDishId).toBeTruthy();
      const fromDining = Boolean(CHOWNOW_PHOTO_MAP[spec.sourceDishId]);
      const fromCatering = spec.sourceDishId in CHOWNOW_CATERING_REUSE_MAP;
      expect(fromDining || fromCatering, spec.sourceDishId).toBe(true);
      if (fromCatering) {
        expect(CHOWNOW_PHOTO_MAP[CHOWNOW_CATERING_REUSE_MAP[spec.sourceDishId].sourceDishId]).toBeTruthy();
      }
      expect(cateringPresentationHint(spec.presentation).length).toBeGreaterThan(20);
    }
  });
});

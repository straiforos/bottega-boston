import { describe, expect, it } from 'vitest';
import { menuSections } from '@/lib/menu-data';
import {
  CHOWNOW_PHOTO_MAP,
  assertMapMatchesDiningMenu,
  resolveChowNowPhotos,
  type ChowNowMenuItem,
  type SiteDishRef,
} from './chownow-photo-map';

const diningDishes: SiteDishRef[] = menuSections.flatMap((section) =>
  section.items.map((item) => ({
    id: item.id,
    name: item.name,
    sectionName: section.name,
  })),
);

const fixtureItems: ChowNowMenuItem[] = [
  { name: 'Espresso | #1', imageUrl: 'https://photos.tryotter.com/menu-photos/espresso.jpeg' },
  { name: 'Double Espresso | #1', imageUrl: 'https://photos.tryotter.com/menu-photos/doppio.jpeg' },
  { name: 'Machiatto', imageUrl: 'https://photos.tryotter.com/menu-photos/mac.jpeg' },
  { name: 'Caprese Salad', imageUrl: 'https://photos.tryotter.com/menu-photos/caprese.jpeg' },
  { name: 'Caprese Salad', imageUrl: 'https://photos.tryotter.com/menu-photos/caprese.jpeg' },
  { name: 'Tiramisu', imageUrl: 'https://photos.tryotter.com/menu-photos/tiramisu.jpeg' },
];

describe('chownow photo map', () => {
  it('only maps dining dishes that exist on the bundled menu', () => {
    expect(() => assertMapMatchesDiningMenu(CHOWNOW_PHOTO_MAP, diningDishes)).not.toThrow();
    expect(CHOWNOW_PHOTO_MAP['dish-12']).toBeUndefined();
    expect(CHOWNOW_PHOTO_MAP['dish-29']).toBeUndefined();
    expect(CHOWNOW_PHOTO_MAP['dish-39']).toBeUndefined();
    expect(CHOWNOW_PHOTO_MAP['dish-40']).toBeUndefined();
  });

  it('rejects a catering dish id', () => {
    expect(() =>
      assertMapMatchesDiningMenu(
        { 'dish-51': 'Cesare' },
        diningDishes,
      ),
    ).toThrow(/catering/i);
  });

  it('resolves mapped names to photo URLs', () => {
    const partial = {
      'dish-0': 'Espresso | #1',
      'dish-22': 'Caprese Salad',
      'dish-42': 'Tiramisu',
    };
    expect(resolveChowNowPhotos(partial, fixtureItems)).toEqual([
      {
        dishId: 'dish-0',
        chowNowName: 'Espresso | #1',
        imageUrl: 'https://photos.tryotter.com/menu-photos/espresso.jpeg',
      },
      {
        dishId: 'dish-22',
        chowNowName: 'Caprese Salad',
        imageUrl: 'https://photos.tryotter.com/menu-photos/caprese.jpeg',
      },
      {
        dishId: 'dish-42',
        chowNowName: 'Tiramisu',
        imageUrl: 'https://photos.tryotter.com/menu-photos/tiramisu.jpeg',
      },
    ]);
  });

  it('fails when a mapped ChowNow name is missing', () => {
    expect(() => resolveChowNowPhotos({ 'dish-0': 'Missing Dish' }, fixtureItems)).toThrow(
      /not found/i,
    );
  });

  it('fails when the same name points at different photos', () => {
    const conflict: ChowNowMenuItem[] = [
      { name: 'Espresso | #1', imageUrl: 'https://a.example/1.jpg' },
      { name: 'Espresso | #1', imageUrl: 'https://a.example/2.jpg' },
    ];
    expect(() => resolveChowNowPhotos({ 'dish-0': 'Espresso | #1' }, conflict)).toThrow(
      /conflicting/i,
    );
  });
});

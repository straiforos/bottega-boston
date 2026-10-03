import { describe, expect, it } from 'vitest';
import { countMenuItems, filterMenu } from './filter-menu';
import type { MenuSection } from './types';

const sections: readonly MenuSection[] = [
  { id: 'breakfast', name: 'Breakfast', note: '', items: [{ id: 'one', name: 'Frittata', price: '$6', description: 'Eggs', tags: ['GF'] }] },
  { id: 'catering', name: 'Catering Pasta', note: '', items: [{ id: 'two', name: 'Lasagna Tray', price: '$90', description: 'Serves ten', tags: [] }] },
];

describe('filterMenu', () => {
  it('returns all items by default', () => expect(countMenuItems(filterMenu(sections, '', 'all'))).toBe(2));
  it('searches content case-insensitively', () => expect(filterMenu(sections, 'gf', 'all')[0]?.items[0]?.name).toBe('Frittata'));
  it('groups catering sections', () => expect(filterMenu(sections, '', 'catering').map((section) => section.name)).toEqual(['Catering Pasta']));
  it('combines search and category filters', () => expect(filterMenu(sections, 'lasagna', 'breakfast')).toEqual([]));
});
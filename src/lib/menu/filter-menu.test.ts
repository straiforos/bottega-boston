import { describe, expect, it } from 'vitest';
import {
  countMenuItems,
  filterMenu,
  selectionForMenuHash,
} from './filter-menu';
import type { MenuSection } from './types';

const sections: readonly MenuSection[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    note: '',
    items: [{ id: 'one', name: 'Frittata', price: '$6', description: 'Eggs', tags: ['GF'] }],
  },
  {
    id: 'catering',
    name: 'Catering Pasta',
    note: '',
    items: [{ id: 'two', name: 'Lasagna Tray', price: '$90', description: 'Serves ten', tags: [] }],
  },
];

describe('filterMenu', () => {
  it('returns all items by default', () => expect(countMenuItems(filterMenu(sections, '', 'all'))).toBe(2));
  it('searches content case-insensitively', () =>
    expect(filterMenu(sections, 'gf', 'all')[0]?.items[0]?.name).toBe('Frittata'));
  it('groups catering sections', () =>
    expect(filterMenu(sections, '', 'catering').map((section) => section.name)).toEqual(['Catering Pasta']));
  it('combines search and category filters', () => expect(filterMenu(sections, 'lasagna', 'breakfast')).toEqual([]));
});

describe('selectionForMenuHash', () => {
  it('selects the Catering filter for a link into the catering trays', () =>
    expect(selectionForMenuHash('#catering', sections)).toBe('catering'));
  it('accepts a hash without the leading #', () =>
    expect(selectionForMenuHash('catering', sections)).toBe('catering'));
  it('shows the whole menu for a link into a normal category', () =>
    expect(selectionForMenuHash('#breakfast', sections)).toBe('all'));
  it('shows the whole menu with no hash or an unknown one', () => {
    expect(selectionForMenuHash('', sections)).toBe('all');
    expect(selectionForMenuHash('#category-99', sections)).toBe('all');
  });
  it('leaves only the catering trays showing after a catering link', () =>
    expect(filterMenu(sections, '', selectionForMenuHash('#catering', sections)).map((s) => s.name)).toEqual([
      'Catering Pasta',
    ]));
});

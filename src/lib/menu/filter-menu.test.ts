import { describe, expect, it } from 'vitest';
import {
  countMenuItems,
  filterMenu,
  menuHrefForSelection,
  menuSectionSlug,
  scrollTargetForMenuHash,
  selectionForMenuHash,
  selectionFromMenuHref,
} from './filter-menu';
import type { MenuSection } from './types';

const sections: readonly MenuSection[] = [
  {
    id: 'category-1',
    name: 'Breakfast',
    note: '',
    items: [{ id: 'one', name: 'Frittata', price: '$6', description: 'Eggs', tags: ['GF'] }],
  },
  {
    id: 'category-6',
    name: 'Pasta',
    note: '',
    items: [{ id: 'p', name: 'Bowl', price: '$14', description: 'Custom', tags: [] }],
  },
  {
    id: 'category-8',
    name: 'Catering · Insalate (Serves 14-16)',
    note: '',
    items: [{ id: 'two', name: 'Cesare Tray', price: '$90', description: 'Serves fourteen', tags: [] }],
  },
];

describe('filterMenu', () => {
  it('returns all items by default', () => expect(countMenuItems(filterMenu(sections, '', 'all'))).toBe(3));
  it('searches content case-insensitively', () =>
    expect(filterMenu(sections, 'gf', 'all')[0]?.items[0]?.name).toBe('Frittata'));
  it('groups catering sections', () =>
    expect(filterMenu(sections, '', 'catering').map((section) => section.name)).toEqual([
      'Catering · Insalate (Serves 14-16)',
    ]));
  it('combines search and category filters', () => expect(filterMenu(sections, 'lasagna', 'category-1')).toEqual([]));
});

describe('menuSectionSlug', () => {
  it('slugifies dining names', () => {
    expect(menuSectionSlug('Pasta')).toBe('pasta');
    expect(menuSectionSlug('Coffee & Tea')).toBe('coffee-tea');
    expect(menuSectionSlug('Antipasti (Appetizers)')).toBe('antipasti');
  });
  it('strips the catering prefix', () =>
    expect(menuSectionSlug('Catering · Pasta Trays (Serves 12-15)')).toBe('pasta-trays'));
});

describe('selectionForMenuHash', () => {
  it('selects the Catering filter for #catering', () =>
    expect(selectionForMenuHash('#catering', sections)).toBe('catering'));
  it('accepts a hash without the leading #', () =>
    expect(selectionForMenuHash('catering', sections)).toBe('catering'));
  it('filters to a dining section via semantic slug', () =>
    expect(selectionForMenuHash('#pasta', sections)).toBe('category-6'));
  it('filters to a dining section via legacy category id', () =>
    expect(selectionForMenuHash('#category-1', sections)).toBe('category-1'));
  it('treats a legacy catering category id as the catering group', () =>
    expect(selectionForMenuHash('#category-8', sections)).toBe('catering'));
  it('shows the whole menu with no hash or an unknown one', () => {
    expect(selectionForMenuHash('', sections)).toBe('all');
    expect(selectionForMenuHash('#category-99', sections)).toBe('all');
  });
  it('leaves only the catering trays showing after a catering link', () =>
    expect(filterMenu(sections, '', selectionForMenuHash('#catering', sections)).map((s) => s.name)).toEqual([
      'Catering · Insalate (Serves 14-16)',
    ]));
});

describe('scrollTargetForMenuHash', () => {
  it('scrolls to the first catering section for #catering', () =>
    expect(scrollTargetForMenuHash('#catering', sections)).toBe('category-8'));
  it('scrolls to the matched dining section for a slug', () =>
    expect(scrollTargetForMenuHash('#pasta', sections)).toBe('category-6'));
});

describe('menuHrefForSelection', () => {
  it('builds semantic query hrefs', () => {
    expect(menuHrefForSelection('all', sections)).toBe('/menu');
    expect(menuHrefForSelection('catering', sections)).toBe('/menu?section=catering');
    expect(menuHrefForSelection('category-6', sections)).toBe('/menu?section=pasta');
  });
});

describe('selectionFromMenuHref', () => {
  it('reads ?section= and legacy hashes', () => {
    expect(selectionFromMenuHref('/menu?section=pasta', sections)).toBe('category-6');
    expect(selectionFromMenuHref('/menu?section=catering', sections)).toBe('catering');
    expect(selectionFromMenuHref('/menu#pasta', sections)).toBe('category-6');
    expect(selectionFromMenuHref('/menu', sections)).toBe('all');
  });
});

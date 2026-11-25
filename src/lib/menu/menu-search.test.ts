import { describe, expect, it } from 'vitest';
import {
  patchMenuSearch,
  scrollTargetForSelection,
  sectionParamForSelection,
  selectionFromMenuSearch,
  validateMenuSearch,
} from './menu-search';
import type { MenuSection } from './types';

const sections: readonly MenuSection[] = [
  {
    id: 'category-6',
    name: 'Pasta',
    note: '',
    items: [{ id: 'p', name: 'Bowl', price: '$14', description: '', tags: [] }],
  },
  {
    id: 'category-8',
    name: 'Catering · Insalate (Serves 14-16)',
    note: '',
    items: [{ id: 'two', name: 'Cesare', price: '$90', description: '', tags: [] }],
  },
];

describe('validateMenuSearch', () => {
  it('keeps known keys and drops empties', () => {
    expect(validateMenuSearch({ section: 'pasta', q: '  ', diet: 'GF,V', junk: 1 })).toEqual({
      section: 'pasta',
      diet: ['GF', 'V'],
    });
  });
});

describe('selectionFromMenuSearch', () => {
  it('resolves section query to the filter selection', () => {
    expect(selectionFromMenuSearch({ section: 'catering' }, sections)).toBe('catering');
    expect(selectionFromMenuSearch({ section: 'pasta' }, sections)).toBe('category-6');
    expect(selectionFromMenuSearch({}, sections)).toBe('all');
  });
});

describe('scrollTargetForSelection', () => {
  it('points at the first catering section for the catering group', () => {
    expect(scrollTargetForSelection('catering', sections)).toBe('category-8');
  });
});

describe('sectionParamForSelection', () => {
  it('round-trips semantic section params', () => {
    expect(sectionParamForSelection('all', sections)).toBeUndefined();
    expect(sectionParamForSelection('catering', sections)).toBe('catering');
    expect(sectionParamForSelection('category-6', sections)).toBe('pasta');
  });
});

describe('patchMenuSearch', () => {
  it('clears empty fields', () => {
    expect(patchMenuSearch({ section: 'pasta', q: 'x', diet: ['GF'] }, { q: '', diet: [] })).toEqual({
      section: 'pasta',
    });
  });
});

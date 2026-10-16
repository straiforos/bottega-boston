import { describe, expect, it } from 'vitest';
import { matchesDietary, toggleTag } from './dietary';
import { filterMenu } from './filter-menu';

describe('dietary filters', () => {
  it('vegan dishes count as vegetarian', () => expect(matchesDietary(['VG'], ['V'])).toBe(true));
  it('vegetarian dishes are not vegan', () => expect(matchesDietary(['V'], ['VG'])).toBe(false));
  it('requires every selected option', () => expect(matchesDietary(['GF'], ['GF', 'V'])).toBe(false));
  it('toggles tags in canonical order', () => expect(toggleTag(['VG'], 'GF')).toEqual(['GF', 'VG']));
  it('filters the menu by diet', () => {
    const sections = [
      {
        id: 's',
        name: 'S',
        note: '',
        items: [
          { id: 'a', name: 'A', price: '', description: '', tags: ['GF'] },
          { id: 'b', name: 'B', price: '', description: '', tags: [] },
        ],
      },
    ];
    expect(filterMenu(sections, '', 'all', ['GF'])[0]?.items.map((i) => i.id)).toEqual(['a']);
  });
});

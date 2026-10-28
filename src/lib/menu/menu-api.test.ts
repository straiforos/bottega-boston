import { describe, expect, it } from 'vitest';
import { buildMenuSections, validateDishDraft } from './menu-shared';

describe('menu admin rules', () => {
  it('rejects a dish without a name', () => {
    expect(validateDishDraft({ name: '  ', price: '$1', description: '', tags: [] })).toBe('Give the dish a name.');
  });
  it('accepts a named dish', () => {
    expect(validateDishDraft({ name: 'Tiramisu', price: '$7.55', description: '', tags: [] })).toBeNull();
  });
  it('groups dishes under sections in sort order', () => {
    const out = buildMenuSections(
      [
        { id: 's2', name: 'B', note: '', sort_order: 1 },
        { id: 's1', name: 'A', note: '', sort_order: 0 },
      ],
      [
        {
          id: 'd2',
          section_id: 's1',
          name: 'Two',
          price: '',
          description: '',
          tags: [],
          image_url: null,
          sort_order: 2,
        },
        {
          id: 'd1',
          section_id: 's1',
          name: 'One',
          price: '',
          description: '',
          tags: [],
          image_url: 'x',
          sort_order: 1,
        },
      ],
    );
    expect(out.map((s) => s.id)).toEqual(['s1', 's2']);
    expect(out[0].items.map((i) => i.id)).toEqual(['d1', 'd2']);
    expect(out[0].items[0].imageUrl).toBe('x');
  });
});

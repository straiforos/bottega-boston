import { matchesDietary, type DietaryTag } from './dietary';
import type { MenuSection } from './types';

export type MenuSelection = 'all' | 'catering' | string;

export function filterMenu(
  sections: readonly MenuSection[],
  query: string,
  selection: MenuSelection,
  dietary: readonly DietaryTag[] = [],
) {
  const term = query.trim().toLocaleLowerCase('en');
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const searchable =
          `${section.name} ${section.note} ${item.name} ${item.description} ${item.tags.join(' ')}`.toLocaleLowerCase(
            'en',
          );
        const matchesQuery = !term || searchable.includes(term);
        const matchesCategory =
          selection === 'all' ||
          selection === section.id ||
          (selection === 'catering' && section.name.startsWith('Catering'));
        return matchesQuery && matchesCategory && matchesDietary(item.tags, dietary);
      }),
    }))
    .filter((section) => section.items.length > 0);
}

export function countMenuItems(sections: readonly MenuSection[]) {
  return sections.reduce((total, section) => total + section.items.length, 0);
}

/**
 * The filter a URL hash should leave selected when the menu page opens.
 *
 * Links into the catering trays (`/menu#category-8`, the "Catering menu" card
 * and the "See the catering menu" button) land on the Catering group, so the
 * rail shows where the guest came from. Any other hash, and no hash at all,
 * leaves the whole menu showing.
 */
export function selectionForMenuHash(hash: string, sections: readonly MenuSection[]): MenuSelection {
  const id = hash.replace(/^#/, '');
  if (!id) return 'all';
  const section = sections.find((item) => item.id === id);
  if (!section) return 'all';
  return section.name.startsWith('Catering') ? 'catering' : 'all';
}

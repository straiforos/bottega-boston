import type { MenuSection } from './types';

export type MenuSelection = 'all' | 'catering' | string;

export function filterMenu(sections: readonly MenuSection[], query: string, selection: MenuSelection) {
  const term = query.trim().toLocaleLowerCase('en');
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const searchable = `${section.name} ${section.note} ${item.name} ${item.description} ${item.tags.join(' ')}`.toLocaleLowerCase('en');
        const matchesQuery = !term || searchable.includes(term);
        const matchesCategory = selection === 'all' || selection === section.id || (selection === 'catering' && section.name.startsWith('Catering'));
        return matchesQuery && matchesCategory;
      }),
    }))
    .filter((section) => section.items.length > 0);
}

export function countMenuItems(sections: readonly MenuSection[]) {
  return sections.reduce((total, section) => total + section.items.length, 0);
}
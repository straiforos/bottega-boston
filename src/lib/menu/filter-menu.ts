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

/** Stable URL slug for a dining (or catering subsection) name — not the DB `category-N` id. */
export function menuSectionSlug(name: string): string {
  return name
    .replace(/^Catering\s*[·•.]\s*/i, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolve a section token (query `section`, or legacy hash) to the filter selection.
 *
 * Semantic slugs (`catering`, `pasta`) are preferred; legacy `category-N`
 * still resolves. Dining tokens filter to that section; catering tokens
 * select the Catering group.
 */
export function selectionForMenuHash(hash: string, sections: readonly MenuSection[]): MenuSelection {
  const id = hash.replace(/^#/, '');
  if (!id) return 'all';
  if (id === 'catering') return 'catering';

  const byId = sections.find((item) => item.id === id);
  if (byId) return byId.name.startsWith('Catering') ? 'catering' : byId.id;

  const bySlug = sections.find((item) => menuSectionSlug(item.name) === id);
  if (bySlug) return bySlug.name.startsWith('Catering') ? 'catering' : bySlug.id;

  return 'all';
}

/** DOM section id to scroll to for a menu hash (DB id, not the URL slug). */
export function scrollTargetForMenuHash(hash: string, sections: readonly MenuSection[]): string {
  const id = hash.replace(/^#/, '');
  if (!id) return '';
  if (id === 'catering') {
    return sections.find((item) => item.name.startsWith('Catering'))?.id ?? '';
  }
  const byId = sections.find((item) => item.id === id);
  if (byId) return byId.id;
  return sections.find((item) => menuSectionSlug(item.name) === id)?.id ?? '';
}

/** Build `/menu` or `/menu?section=slug` for offering / CTA links. */
export function menuHrefForSelection(selection: MenuSelection, sections: readonly MenuSection[]): string {
  if (selection === 'all') return '/menu';
  if (selection === 'catering') return '/menu?section=catering';
  const section = sections.find((item) => item.id === selection);
  if (!section || section.name.startsWith('Catering')) return '/menu?section=catering';
  return `/menu?section=${menuSectionSlug(section.name)}`;
}

/** Read filter selection from a stored offering href (`?section=` or legacy `#`). */
export function selectionFromMenuHref(href: string, sections: readonly MenuSection[]): MenuSelection {
  try {
    const url = new URL(href.trim(), 'http://bottega.local');
    if (url.pathname !== '/menu') return 'all';
    const section = url.searchParams.get('section');
    if (section) return selectionForMenuHash(section, sections);
    if (url.hash) return selectionForMenuHash(url.hash, sections);
  } catch {
    /* fall through */
  }
  return 'all';
}

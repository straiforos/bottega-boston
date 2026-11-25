import { DIETARY_OPTIONS, type DietaryTag } from './dietary';
import {
  menuSectionSlug,
  selectionForMenuHash,
  type MenuSelection,
} from './filter-menu';
import type { MenuSection } from './types';

/** URL search state for `/menu` — source of truth for the filter UI. */
export type MenuSearch = {
  /** Semantic section (`pasta`, `catering`) or legacy `category-N`. Omit for all. */
  section?: string;
  /** Free-text dish search. */
  q?: string;
  /** Active dietary tags. */
  diet?: DietaryTag[];
};

const DIET_TAGS = new Set<string>(DIETARY_OPTIONS.map((o) => o.tag));

function parseDiet(value: unknown): DietaryTag[] | undefined {
  const parts = Array.isArray(value)
    ? value.flatMap((v) => String(v).split(','))
    : String(value ?? '')
        .split(',');
  const tags = parts
    .map((t) => t.trim())
    .filter((t): t is DietaryTag => DIET_TAGS.has(t));
  return tags.length > 0 ? tags : undefined;
}

/** TanStack `validateSearch` — strips junk, keeps the URL shareable. */
export function validateMenuSearch(raw: Record<string, unknown>): MenuSearch {
  const section = typeof raw.section === 'string' && raw.section.trim() ? raw.section.trim() : undefined;
  const q = typeof raw.q === 'string' && raw.q.trim() ? raw.q.trim() : undefined;
  const diet = parseDiet(raw.diet);
  const out: MenuSearch = {};
  if (section) out.section = section;
  if (q) out.q = q;
  if (diet) out.diet = diet;
  return out;
}

/** Resolve search.section (or a legacy hash token) to the filter selection. */
export function selectionFromMenuSearch(
  search: Pick<MenuSearch, 'section'>,
  sections: readonly MenuSection[],
): MenuSelection {
  return selectionForMenuHash(search.section ?? '', sections);
}

/** DOM id to scroll to for the resolved selection. */
export function scrollTargetForSelection(
  selection: MenuSelection,
  sections: readonly MenuSection[],
): string {
  if (selection === 'all') return '';
  if (selection === 'catering') {
    return sections.find((item) => item.name.startsWith('Catering'))?.id ?? '';
  }
  return sections.find((item) => item.id === selection)?.id ?? '';
}

/** Canonical `section` query value for a selection (omit when all). */
export function sectionParamForSelection(
  selection: MenuSelection,
  sections: readonly MenuSection[],
): string | undefined {
  if (selection === 'all') return undefined;
  if (selection === 'catering') return 'catering';
  const section = sections.find((item) => item.id === selection);
  if (!section || section.name.startsWith('Catering')) return 'catering';
  return menuSectionSlug(section.name);
}

/** Merge a patch into menu search, dropping empty keys. */
export function patchMenuSearch(prev: MenuSearch, patch: Partial<MenuSearch>): MenuSearch {
  const next: MenuSearch = { ...prev, ...patch };
  if (patch.section === 'all' || next.section === 'all') delete next.section;
  if (!next.section) delete next.section;
  if (!next.q?.trim()) delete next.q;
  else next.q = next.q.trim();
  if (!next.diet?.length) delete next.diet;
  return next;
}

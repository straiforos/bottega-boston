import { useMemo, useState } from 'react';
import { countMenuItems, filterMenu } from '@/lib/menu/filter-menu';
import type { MenuSection } from '@/lib/menu/types';

export function useMenuFilters(menuSections: readonly MenuSection[]) {
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState('all');
  const sections = useMemo(() => filterMenu(menuSections, query, selection), [menuSections, query, selection]);
  const count = useMemo(() => countMenuItems(sections), [sections]);
  const reset = () => { setQuery(''); setSelection('all'); };
  return { query, setQuery, selection, setSelection, sections, count, reset };
}
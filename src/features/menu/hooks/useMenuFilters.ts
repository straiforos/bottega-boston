import { useMemo, useState } from 'react';
import { countMenuItems, filterMenu } from '@/lib/menu/filter-menu';
import type { DietaryTag } from '@/lib/menu/dietary';
import type { MenuSection } from '@/lib/menu/types';

export function useMenuFilters(menuSections: readonly MenuSection[]) {
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState('all');
  const [dietary, setDietary] = useState<DietaryTag[]>([]);
  const sections = useMemo(
    () => filterMenu(menuSections, query, selection, dietary),
    [menuSections, query, selection, dietary],
  );
  const count = useMemo(() => countMenuItems(sections), [sections]);
  const reset = () => {
    setQuery('');
    setSelection('all');
    setDietary([]);
  };
  return { dietary, setDietary, query, setQuery, selection, setSelection, sections, count, reset };
}

import { useEffect, useMemo, useState } from 'react';
import {
  countMenuItems,
  filterMenu,
  selectionForMenuHash,
  type MenuSelection,
} from '@/lib/menu/filter-menu';
import type { DietaryTag } from '@/lib/menu/dietary';
import type { MenuSection } from '@/lib/menu/types';

/**
 * Menu search, category and dietary state.
 *
 * `hash` is the current URL hash: opening `/menu#category-8` (the catering
 * links) arrives with the Catering filter already selected. The server never
 * sees a hash, so the page renders the full menu first and follows the hash
 * only once it is live in the browser, which keeps hydration consistent. A
 * click in the rail wins over the hash until the guest navigates again.
 */
export function useMenuFilters(menuSections: readonly MenuSection[], hash = '') {
  const [query, setQuery] = useState('');
  const [manualSelection, setManualSelection] = useState<string | null>(null);
  const [dietary, setDietary] = useState<DietaryTag[]>([]);
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    setActiveHash(hash);
    setManualSelection(null);
  }, [hash]);

  const selection: MenuSelection = manualSelection ?? selectionForMenuHash(activeHash, menuSections);
  const sections = useMemo(
    () => filterMenu(menuSections, query, selection, dietary),
    [menuSections, query, selection, dietary],
  );
  const count = useMemo(() => countMenuItems(sections), [sections]);
  const reset = () => {
    setQuery('');
    setManualSelection('all');
    setDietary([]);
  };
  return {
    dietary,
    setDietary,
    query,
    setQuery,
    selection,
    setSelection: setManualSelection,
    sections,
    count,
    reset,
    /** The hash the filter is currently following; empty until the page is live. */
    appliedHash: activeHash,
  };
}

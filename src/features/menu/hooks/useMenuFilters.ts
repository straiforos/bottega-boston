import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
 * `hash` is the current URL hash: opening `/menu#catering` arrives with the
 * Catering filter already selected. The server never sees a hash, so SSR and
 * the hydration pass render the full menu; `useLayoutEffect` applies the hash
 * before the browser paints so offering → /menu#… links do not flash "all".
 * A click in the rail wins over the hash until the guest navigates again.
 */
export function useMenuFilters(menuSections: readonly MenuSection[], hash = '') {
  const [query, setQuery] = useState('');
  const [manualSelection, setManualSelection] = useState<string | null>(null);
  const [dietary, setDietary] = useState<DietaryTag[]>([]);
  const [hashReady, setHashReady] = useState(false);

  useLayoutEffect(() => {
    setHashReady(true);
  }, []);

  useEffect(() => {
    setManualSelection(null);
  }, [hash]);

  const liveHash = hashReady ? hash : '';
  const selection: MenuSelection = manualSelection ?? selectionForMenuHash(liveHash, menuSections);
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
    /** Hash driving the filter; empty until layout effect (before paint). */
    appliedHash: liveHash,
  };
}

import { useEffect, useMemo, useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  countMenuItems,
  filterMenu,
  type MenuSelection,
} from '@/lib/menu/filter-menu';
import type { DietaryTag } from '@/lib/menu/dietary';
import { menuSections as fallbackMenu } from '@/lib/menu-data';
import { menuQueryOptions } from '@/lib/menu/menu-api';
import {
  patchMenuSearch,
  sectionParamForSelection,
  selectionFromMenuSearch,
  type MenuSearch,
} from '@/lib/menu/menu-search';

const menuRoute = getRouteApi('/_site/menu');

/**
 * Menu filters driven by `/menu` search params (`section`, `q`, `diet`).
 * Selection resolves synchronously from search so the rail never waits on the loader.
 */
export function useMenuFilters() {
  const search = menuRoute.useSearch();
  const navigate = menuRoute.useNavigate();
  const { data: menuSections = fallbackMenu } = useQuery(menuQueryOptions);

  const [qDraft, setQDraft] = useState(search.q ?? '');
  useEffect(() => {
    setQDraft(search.q ?? '');
  }, [search.q]);

  useEffect(() => {
    const trimmed = qDraft.trim();
    if (trimmed === (search.q ?? '')) return;
    const id = window.setTimeout(() => {
      void navigate({
        search: (prev) => patchMenuSearch(prev, { q: trimmed || undefined }),
        replace: true,
        resetScroll: false,
      });
    }, 200);
    return () => window.clearTimeout(id);
  }, [qDraft, search.q, navigate]);

  // Resolve from the URL immediately — loader selection lags a frame on navigate and flashes "all".
  const selection = useMemo(
    () => selectionFromMenuSearch({ section: search.section }, menuSections),
    [search.section, menuSections],
  );

  const dietary = search.diet ?? [];
  const query = search.q ?? '';
  const sections = useMemo(
    () => filterMenu(menuSections, query, selection, dietary),
    [menuSections, query, selection, dietary],
  );
  const count = useMemo(() => countMenuItems(sections), [sections]);

  const updateSearch = (patch: Partial<MenuSearch>) => {
    void navigate({
      search: (prev) => patchMenuSearch(prev, patch),
      replace: true,
      resetScroll: false,
    });
  };

  const setSelection = (value: MenuSelection) => {
    updateSearch({ section: sectionParamForSelection(value, menuSections) });
  };

  const setDietary = (value: DietaryTag[]) => {
    updateSearch({ diet: value });
  };

  const reset = () => {
    setQDraft('');
    void navigate({ search: {}, replace: true, resetScroll: false });
  };

  return {
    dietary,
    setDietary,
    query: qDraft,
    setQuery: setQDraft,
    selection,
    setSelection,
    sections,
    count,
    reset,
  };
}

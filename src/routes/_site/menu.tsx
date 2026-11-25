import { createFileRoute, redirect } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import markDishImagesLoaded from '@/features/menu/mark-dish-images-loaded.js?raw';
import { MenuPage } from '@/features/menu/MenuPage';
import { menuSections as fallbackMenu } from '@/lib/menu-data';
import { menuQueryOptions } from '@/lib/menu/menu-api';
import {
  scrollTargetForSelection,
  selectionFromMenuSearch,
  validateMenuSearch,
} from '@/lib/menu/menu-search';
import type { MenuSection } from '@/lib/menu/types';
import { pageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/menu')({
  validateSearch: validateMenuSearch,
  // Legacy `/menu#catering` (and `#category-N`) → `?section=…` so SSR sees the filter.
  beforeLoad: ({ location }) => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash) return;
    throw redirect({
      to: '/menu',
      search: (prev) => ({ ...prev, section: hash }),
      hash: '',
      replace: true,
    });
  },
  // Prefetch dishes + seed deep-link scroll. Filter selection itself is resolved
  // synchronously from search in useMenuFilters — no loaderDeps, so rail clicks
  // do not re-run the loader (that pending flash was the flicker).
  loader: async ({ context: { queryClient }, location: { search } }) => {
    let menu: readonly MenuSection[] = fallbackMenu;
    try {
      menu = await queryClient.ensureQueryData(menuQueryOptions);
    } catch {
      /* client refetch / live SSR will populate */
    }
    const selection = selectionFromMenuSearch({ section: search.section }, menu);
    return {
      selection,
      scrollTarget: scrollTargetForSelection(selection, menu),
    };
  },
  head: () => ({
    ...pageHead({
      ...restaurantContent.metadata.menu,
      path: '/menu',
    }),
    scripts: [{ children: markDishImagesLoaded }],
  }),
  component: MenuPage,
});

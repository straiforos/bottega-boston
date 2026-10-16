import { Button, Display, Marquee, PillLabel, Serif } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { useQuery } from '@tanstack/react-query';
import { menuSections as fallbackMenu } from '@/lib/menu-data';
import { menuQueryOptions } from '@/lib/menu/menu-api';
import { useStaffSession } from '@/hooks/useStaffSession';
import { staffContent } from '@/content/en/staff';
import { AddDish } from './admin/AddDish';
import { EditableDish } from './admin/EditableDish';
import { MenuDishCard } from './components/MenuDishCard';
import { MenuFilter } from './components/MenuFilter';
import { useMenuFilterRail } from './hooks/useMenuFilterRail';
import { useMenuFilters } from './hooks/useMenuFilters';

export function MenuPage() {
  const { data: menuSections = fallbackMenu } = useQuery(menuQueryOptions);
  const { isAdmin } = useStaffSession();
  const filters = useMenuFilters(menuSections);
  const rail = useMenuFilterRail();
  return (
    <>
      <BottegaHeader />
      <main className="real-menu">
        <header className="menu-page-heading section-inner">
          <p className="eyebrow">Buon appetito</p>
          <Display as="h1" size="xl" tone="forest">
            Bottega menu
          </Display>
          <Serif as="p" size="md" tone="forest">
            Pasta, panini & a little dolce vita.
          </Serif>
          <p className="menu-photo-note">
            Illustrative images — not photographs of Bottega’s actual dishes. Presentation and portions may vary.
          </p>
          {isAdmin && <PillLabel variant="chip-forest">{staffContent.editing}</PillLabel>}
          <div className="menu-legend">
            <PillLabel variant="chip-forest">GF · Gluten free</PillLabel>
            <PillLabel variant="chip-forest">V · Vegetarian</PillLabel>
            <PillLabel variant="chip-forest">VG · Vegan</PillLabel>
          </div>
        </header>
        <Marquee text="#pastaislife · #familyislife" variant="forest" />
        <div className="menu-browse section-inner">
          <div className="menu-filter-rail">
            <MenuFilter
              menuSections={menuSections}
              query={filters.query}
              selection={filters.selection}
              count={filters.count}
              dietary={filters.dietary}
              onDietaryChange={filters.setDietary}
              onQueryChange={filters.setQuery}
              onSelectionChange={filters.setSelection}
            />
          </div>
          <div className="menu-content">
            {filters.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="menu-category-section"
                aria-labelledby={`${section.id}-title`}
              >
                <div className="menu-category-heading">
                  <Display as="h2" size="sm" tone="forest" id={`${section.id}-title`}>
                    {section.name}
                  </Display>
                  {section.note && <p>{section.note}</p>}
                </div>
                <div className="menu-dish-grid">
                  {section.items.map((item) =>
                    isAdmin ? <EditableDish key={item.id} item={item} /> : <MenuDishCard key={item.id} item={item} />,
                  )}
                </div>
                {isAdmin && (
                  <AddDish
                    sectionId={section.id}
                    nextSortOrder={(menuSections.find((s) => s.id === section.id)?.items.length ?? 0) + 1}
                  />
                )}
              </section>
            ))}
            {filters.count === 0 && (
              <div className="menu-no-results">
                <Serif size="md" tone="forest">
                  No dishes found.
                </Serif>
                <Button variant="outline" onClick={filters.reset}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Marquee text="Made with amore" />
    </>
  );
}

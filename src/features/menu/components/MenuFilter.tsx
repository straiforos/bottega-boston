import { Button, TextField } from '@/design-system/bottega-f5161c';
import type { MenuSection } from '@/lib/menu/types';

interface MenuFilterProps {
  menuSections: readonly MenuSection[];
  query: string;
  selection: string;
  count: number;
  onQueryChange: (value: string) => void;
  onSelectionChange: (value: string) => void;
}

export function MenuFilter({
  menuSections,
  query,
  selection,
  count,
  onQueryChange,
  onSelectionChange,
}: MenuFilterProps) {
  return (
    <aside className="menu-filter" aria-label="Browse menu">
      <TextField
        label="Search the menu"
        type="search"
        placeholder="Pasta, cappuccino, cannoli…"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <nav className="menu-category-list" aria-label="Menu categories">
        <Button
          variant={selection === 'all' ? 'primary' : 'ghost'}
          size="sm"
          aria-pressed={selection === 'all'}
          onClick={() => onSelectionChange('all')}
        >
          All dishes
        </Button>
        {menuSections
          .filter((section) => !section.name.startsWith('Catering'))
          .map((section) => (
            <Button
              key={section.id}
              variant={selection === section.id ? 'primary' : 'ghost'}
              size="sm"
              aria-pressed={selection === section.id}
              onClick={() => onSelectionChange(section.id)}
            >
              {section.name.split(' (')[0]}
            </Button>
          ))}
        <Button
          variant={selection === 'catering' ? 'primary' : 'ghost'}
          size="sm"
          aria-pressed={selection === 'catering'}
          onClick={() => onSelectionChange('catering')}
        >
          Catering
        </Button>
      </nav>
      <p className="menu-results" role="status">
        {count} {count === 1 ? 'item' : 'items'}
      </p>
    </aside>
  );
}

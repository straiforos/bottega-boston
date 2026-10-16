import { Button, Checkbox, TextField } from '@/design-system/bottega-f5161c';
import { DIETARY_OPTIONS, toggleTag, type DietaryTag } from '@/lib/menu/dietary';
import type { MenuSection } from '@/lib/menu/types';

interface MenuFilterProps {
  menuSections: readonly MenuSection[];
  query: string;
  selection: string;
  count: number;
  dietary: readonly DietaryTag[];
  onDietaryChange: (value: DietaryTag[]) => void;
  onQueryChange: (value: string) => void;
  onSelectionChange: (value: string) => void;
}

export function MenuFilter({
  menuSections,
  query,
  selection,
  count,
  dietary,
  onDietaryChange,
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
      <fieldset className="menu-dietary-filter">
        <legend className="bt-field__label">Dietary</legend>
        {DIETARY_OPTIONS.map((option) => (
          <Checkbox
            key={option.tag}
            checked={dietary.includes(option.tag)}
            onChange={() => onDietaryChange(toggleTag(dietary, option.tag) as DietaryTag[])}
          >
            {option.label}
          </Checkbox>
        ))}
      </fieldset>
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

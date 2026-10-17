import { useId, useState } from 'react';
import { Button, Radio, TextField } from '@/design-system/bottega-f5161c';
import { EditorIcon } from '@/components/EditorIcon';
import { eventsContent } from '@/content/en/events';
import { MenuDishCard } from '@/features/menu/components/MenuDishCard';
import { formatMoney, parsePriceOptions, type OrderLineInput } from '@/lib/events/requests';
import type { MenuItem } from '@/lib/menu/types';

const t = eventsContent.requests;

/** The same dish imagery as the menu, with explicit size and quantity choices. */
export function OrderTrayCard({ item, onAdd }: { item: MenuItem; onAdd: (line: OrderLineInput) => void }) {
  const options = parsePriceOptions(item.price);
  const [option, setOption] = useState(options[0]?.label ?? '');
  const [quantity, setQuantity] = useState(1);
  const name = useId();
  const chosen = options.find((price) => price.label === option) ?? options[0];

  return (
    <MenuDishCard item={item} actions={
      <div className="request-tray-controls">
        {options.length > 1 && (
          <fieldset className="request-tray-options">
            <legend className="bt-field__label">{t.size}</legend>
            {options.map((price) => (
              <Radio key={price.label} name={name} checked={chosen?.label === price.label} onChange={() => setOption(price.label)}>
                {price.label}{price.amount != null ? ` · ${formatMoney(price.amount)}` : ''}
              </Radio>
            ))}
          </fieldset>
        )}
        <TextField label={t.quantity} aria-label={`${t.quantity} for ${item.name}`} type="number" min={1} max={50} value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Math.min(50, Math.floor(Number(event.target.value)) || 1)))} />
        <Button type="button" variant="outline" size="sm" aria-label={`${t.addItem}: ${item.name}`}
          onClick={() => onAdd({ itemId: item.id, option: chosen?.label ?? '', quantity })}>
          <EditorIcon kind="plus" />{t.addItem}
        </Button>
      </div>
    } />
  );
}
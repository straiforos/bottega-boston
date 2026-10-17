import { useId, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Serif } from '@/design-system/bottega-f5161c';
import { eventsContent } from '@/content/en/events';
import { menuQueryOptions } from '@/lib/menu/menu-api';
import { menuSections as bundledMenu } from '@/lib/menu-data';
import { formatMoney, orderTotal, parsePriceOptions, type OrderLine, type OrderLineInput } from '@/lib/events/requests';

const t = eventsContent.requests;

interface Props {
  lines: OrderLineInput[];
  onChange: (lines: OrderLineInput[]) => void;
  error?: string;
}

/** Builds a catering order from the real catering trays on the menu. */
export function OrderPicker({ lines, onChange, error }: Props) {
  const { data } = useQuery(menuQueryOptions);
  const catalog = useMemo(() => {
    const sections = (data ?? bundledMenu).filter((s) => s.name.startsWith('Catering'));
    return sections.map((s) => ({ ...s, name: s.name.replace(/^Catering ·\s*/, '') }));
  }, [data]);
  const items = useMemo(() => new Map(catalog.flatMap((s) => s.items.map((i) => [i.id, i] as const))), [catalog]);

  const [itemId, setItemId] = useState('');
  const [option, setOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const ids = { item: useId(), size: useId(), qty: useId() };
  const options = itemId ? parsePriceOptions(items.get(itemId)?.price ?? '') : [];

  const priced: OrderLine[] = lines.map((l) => {
    const item = items.get(l.itemId);
    const opt = parsePriceOptions(item?.price ?? '').find((o) => o.label === l.option);
    return { ...l, name: item?.name ?? l.itemId, unitPrice: opt?.amount ?? null };
  });

  const add = () => {
    if (!itemId) return;
    const chosen = options.length > 1 ? option : (options[0]?.label ?? '');
    if (options.length > 1 && !chosen) return;
    const existing = lines.findIndex((l) => l.itemId === itemId && l.option === chosen);
    const next =
      existing >= 0
        ? lines.map((l, i) => (i === existing ? { ...l, quantity: Math.min(50, l.quantity + quantity) } : l))
        : [...lines, { itemId, option: chosen, quantity }];
    onChange(next);
    setItemId('');
    setOption('');
    setQuantity(1);
  };

  return (
    <fieldset className="request-order">
      <legend className="bt-field__label">{t.order}</legend>
      <div className="request-order-add">
        <div className="bt-field">
          <label className="bt-field__label" htmlFor={ids.item}>{t.item}</label>
          <select
            id={ids.item}
            className="bt-input"
            value={itemId}
            onChange={(e) => {
              setItemId(e.target.value);
              setOption('');
            }}
          >
            <option value="">{t.pickItem}</option>
            {catalog.map((s) => (
              <optgroup key={s.id} label={s.name}>
                {s.items.map((i) => (
                  <option key={i.id} value={i.id}>{`${i.name} — ${i.price}`}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {options.length > 1 && (
          <div className="bt-field">
            <label className="bt-field__label" htmlFor={ids.size}>{t.size}</label>
            <select id={ids.size} className="bt-input" value={option} onChange={(e) => setOption(e.target.value)}>
              <option value="">{t.size}</option>
              {options.map((o) => (
                <option key={o.label} value={o.label}>
                  {o.amount != null ? `${o.label} ${formatMoney(o.amount)}` : o.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="bt-field">
          <label className="bt-field__label" htmlFor={ids.qty}>{t.quantity}</label>
          <input
            id={ids.qty}
            className="bt-input"
            type="number"
            min={1}
            max={50}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={!itemId || (options.length > 1 && !option)}>
          {t.addItem}
        </Button>
      </div>
      {priced.length === 0 ? (
        <p className="request-muted">{t.empty}</p>
      ) : (
        <ul className="request-order-lines">
          {priced.map((l, index) => (
            <li key={`${l.itemId}-${l.option}`}>
              <span>
                {l.quantity} × {l.name}
                {l.option ? ` (${l.option})` : ''}
              </span>
              <span>{l.unitPrice != null ? formatMoney(l.unitPrice * l.quantity) : ''}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(lines.filter((_, i) => i !== index))}>
                {t.remove}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {priced.length > 0 && (
        <div>
          <Serif as="p" size="sm" tone="forest">{t.total(formatMoney(orderTotal(priced)))}</Serif>
          <p className="request-muted">{t.totalNote}</p>
        </div>
      )}
      {error && <p className="request-error" role="alert">{error}</p>}
    </fieldset>
  );
}

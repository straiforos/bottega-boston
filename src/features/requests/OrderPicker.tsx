import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Serif } from '@/design-system/bottega-f5161c';
import { eventsContent } from '@/content/en/events';
import { menuQueryOptions } from '@/lib/menu/menu-api';
import { menuSections as bundledMenu } from '@/lib/menu-data';
import { formatMoney, orderTotal, parsePriceOptions, type OrderLine, type OrderLineInput } from '@/lib/events/requests';
import { EditorIcon } from '@/components/EditorIcon';
import { OrderTrayCard } from './OrderTrayCard';

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

  const [sectionId, setSectionId] = useState<string | null>(null);
  const section = catalog.find((s) => s.id === sectionId) ?? catalog[0];

  const priced: OrderLine[] = lines.map((l) => {
    const item = items.get(l.itemId);
    const opt = parsePriceOptions(item?.price ?? '').find((o) => o.label === l.option);
    return { ...l, name: item?.name ?? l.itemId, unitPrice: opt?.amount ?? null };
  });

  const add = ({ itemId, option, quantity }: OrderLineInput) => {
    const existing = lines.findIndex((l) => l.itemId === itemId && l.option === option);
    const next =
      existing >= 0
        ? lines.map((l, i) => (i === existing ? { ...l, quantity: Math.min(50, l.quantity + quantity) } : l))
        : [...lines, { itemId, option, quantity }];
    onChange(next);
  };

  return (
    <fieldset className="request-order">
      <legend className="bt-field__label">{t.order}</legend>
      <div className="request-catalog-categories" role="group" aria-label={t.trayCategories}>
        {catalog.map((category) => (
          <Button key={category.id} type="button" variant={section?.id === category.id ? 'primary' : 'ghost'} size="sm"
            aria-pressed={section?.id === category.id} onClick={() => setSectionId(category.id)}>
            {category.name}
          </Button>
        ))}
      </div>
      {section && (
        <section className="request-catalog-section" aria-label={section.name}>
          <Serif as="h3" size="md" tone="forest">{section.name}</Serif>
          {section.note && <p className="request-muted">{section.note}</p>}
          <div className="request-catalog-grid">
            {section.items.map((item) => <OrderTrayCard key={item.id} item={item} onAdd={add} />)}
          </div>
        </section>
      )}
      <Serif as="h3" size="sm" tone="forest">{t.orderSummary}</Serif>
      <div aria-live="polite" aria-atomic="true">
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
              <Button type="button" variant="ghost" size="sm" aria-label={`${t.remove}: ${l.name}${l.option ? ` (${l.option})` : ''}`} onClick={() => onChange(lines.filter((_, i) => i !== index))}>
                <EditorIcon kind="trash" />
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
      </div>
      {error && <p className="request-error" role="alert">{error}</p>}
    </fieldset>
  );
}

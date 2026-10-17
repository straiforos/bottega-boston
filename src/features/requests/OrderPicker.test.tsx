import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { OrderLineInput } from '@/lib/events/requests';
import { OrderPicker } from './OrderPicker';

vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: [
  { id: 'pasta', name: 'Catering · Pasta', note: '', items: [
    { id: 'lasagna', name: 'Lasagna', price: 'Small $70 | Large $140', description: '', tags: [] },
  ] },
  { id: 'dessert', name: 'Catering · Dolci', note: '', items: [
    { id: 'tiramisu', name: 'Tiramisu', price: '$40', description: '', tags: [] },
  ] },
] }) }));
vi.mock('@/lib/menu/menu-api', () => ({ menuQueryOptions: {} }));
vi.mock('@/features/menu/components/DishImage', () => ({ DishImage: () => null }));

afterEach(cleanup);

it('visual choices preserve item IDs, sizes and quantities in the itemized order', () => {
  let saved: OrderLineInput[] = [];
  function Harness() {
    const [lines, setLines] = useState<OrderLineInput[]>([]);
    return <OrderPicker lines={lines} onChange={(next) => { saved = next; setLines(next); }} />;
  }
  render(<Harness />);
  fireEvent.click(screen.getByRole('radio', { name: /Large/ }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Quantity for Lasagna' }), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add to order: Lasagna' }));
  expect(saved).toEqual([{ itemId: 'lasagna', option: 'Large', quantity: 2 }]);
  fireEvent.click(screen.getByRole('button', { name: 'Dolci' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add to order: Tiramisu' }));
  expect(saved).toEqual([
    { itemId: 'lasagna', option: 'Large', quantity: 2 },
    { itemId: 'tiramisu', option: '', quantity: 1 },
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'Remove: Lasagna (Large)' }));
  expect(saved).toEqual([{ itemId: 'tiramisu', option: '', quantity: 1 }]);
});
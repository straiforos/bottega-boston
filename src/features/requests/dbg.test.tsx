import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SnackbarProvider } from '@/design-system/bottega-f5161c';
import { RequestForm } from './RequestForm';

vi.mock('@tanstack/react-start', () => ({ useServerFn: () => vi.fn() }));
vi.mock('@/lib/events/requests.functions', () => ({ submitRequest: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: [] }) }));
vi.mock('@/lib/menu/menu-api', () => ({ menuQueryOptions: {} }));
vi.mock('@/features/menu/components/DishImage', () => ({ DishImage: () => null }));
vi.mock('./Turnstile', () => ({ Turnstile: () => null }));

afterEach(cleanup);

it('debug', () => {
  render(<SnackbarProvider><RequestForm kind="catering" /></SnackbarProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
  screen.getAllByRole('alert').forEach((el, i) => console.log(i, JSON.stringify(el.className), JSON.stringify(el.textContent)));
  console.log(document.body.querySelector('.bt-snackbar-region')?.outerHTML.slice(0, 500));
  expect(true).toBe(true);
});

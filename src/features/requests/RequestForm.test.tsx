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

it('a validation error shows the danger snackbar above the form', () => {
  render(<SnackbarProvider><RequestForm kind="catering" /></SnackbarProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
  const alert = screen.getAllByRole('alert').find((el) => el.classList.contains('bt-snackbar--danger'));
  expect(alert).toBeDefined();
  expect(alert?.textContent).toContain('Some fields need attention — please correct the highlighted fields and try again.');
});

import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = render(<SiteFooter />);
    expect((await axe(container)).violations).toEqual([]);
  });
});

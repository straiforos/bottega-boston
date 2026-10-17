import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { SiteFooter } from './SiteFooter';
import { links } from '@/content/links';

describe('SiteFooter', () => {
  it('has no detectable accessibility violations', async () => {
    const { container } = render(<SiteFooter />);
    expect((await axe(container)).violations).toEqual([]);
  });
  it('links each social profile in its own new tab', () => {
    const { container } = render(<SiteFooter />);
    const instagram = container.querySelector('a[aria-label="Bottega on Instagram"]');
    const facebook = container.querySelector('a[aria-label="Bottega on Facebook"]');
    expect(instagram).toHaveAttribute('href', links.instagram);
    expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/EATBOTTEGA/');
    for (const link of [instagram, facebook]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});

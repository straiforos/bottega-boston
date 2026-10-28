import { describe, expect, it } from 'vitest';
import { apexRedirectLocation } from './canonical-host';

describe('apexRedirectLocation', () => {
  it('redirects www to the configured apex, keeping path and query', () => {
    const url = new URL('https://www.bottega.boston/menu?x=1');
    expect(apexRedirectLocation(url, 'https://bottega.boston')).toBe(
      'https://bottega.boston/menu?x=1',
    );
  });

  it('returns null for the apex itself', () => {
    const url = new URL('https://bottega.boston/menu');
    expect(apexRedirectLocation(url, 'https://bottega.boston')).toBeNull();
  });

  it('returns null when SITE_ORIGIN is missing or invalid', () => {
    const url = new URL('https://www.bottega.boston/');
    expect(apexRedirectLocation(url, undefined)).toBeNull();
    expect(apexRedirectLocation(url, 'not-a-url')).toBeNull();
  });
});

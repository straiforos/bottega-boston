import { describe, expect, it } from 'vitest';
import { ORDER_NOW_URL } from '@/lib/email/blocks';
import { staffPageHead } from './page-head';
import { buildRobotsTxt, ROBOTS_DISALLOW } from './robots';
import { buildSitemapXml, INDEXABLE_PATHS, sitemapRouteInventoryVersion } from './sitemap';

describe('sitemap inventory', () => {
  it('exports inventory version 1 for the mockup plugin contract', () => {
    expect(sitemapRouteInventoryVersion).toBe(1);
  });

  it('lists exactly the five indexable guest paths', () => {
    expect([...INDEXABLE_PATHS]).toEqual(['/', '/menu', '/order', '/catering', '/events/request']);
  });

  it('never includes staff, API, media, or preview paths', () => {
    const xml = buildSitemapXml('https://bottega.boston');
    for (const blocked of ['/admin', '/emails', '/api', '/media', '/unsubscribed', '__mockup', '__component']) {
      expect(xml).not.toContain(blocked);
    }
  });

  it('emits absolute loc URLs under the given origin', () => {
    const xml = buildSitemapXml('https://bottega.boston');
    expect(xml).toContain('<loc>https://bottega.boston/</loc>');
    expect(xml).toContain('<loc>https://bottega.boston/order</loc>');
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });
});

describe('robots.txt', () => {
  it('disallows every staff and preview prefix and points at the sitemap', () => {
    const body = buildRobotsTxt('https://bottega.boston');
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
    for (const path of ROBOTS_DISALLOW) {
      expect(body).toContain(`Disallow: ${path}`);
    }
    expect(body).toContain('Sitemap: https://bottega.boston/sitemap.xml');
  });
});

describe('staff page head', () => {
  it('always emits noindex, nofollow', () => {
    const head = staffPageHead({ title: 'Staff', description: 'Private' });
    expect(head.meta).toContainEqual({ name: 'robots', content: 'noindex, nofollow' });
  });
});

describe('order now URL', () => {
  it('points at the indexable /order route', () => {
    expect(ORDER_NOW_URL).toBe('/order');
  });
});

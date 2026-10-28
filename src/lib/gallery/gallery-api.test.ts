import { describe, expect, it, vi } from 'vitest';

vi.mock('./gallery-assets', () => ({
  galleryAssets: { 'social-1': { url: '/bundled-1.jpg', versions: [] } },
}));

import { buildGalleryItems, moveTile, validateTileDraft, type GalleryRow } from './gallery-shared';

const row = (over: Partial<GalleryRow>): GalleryRow => ({
  id: 'a',
  media_type: 'image',
  asset_key: null,
  media_url: null,
  poster_url: null,
  variants: null,
  alt: 'alt',
  caption: '',
  sort_order: 0,
  ...over,
});

describe('gallery rules', () => {
  it('requires alt text', () => {
    expect(validateTileDraft({ alt: '  ', caption: '' })).toMatch(/screen readers/);
  });

  it('resolves bundled media by asset key', () => {
    const items = buildGalleryItems([row({ asset_key: 'social-1', sort_order: 1 })]);
    expect(items[0]?.url).toBe('/bundled-1.jpg');
  });

  it('drops rows with nothing to show', () => {
    expect(buildGalleryItems([row({})])).toEqual([]);
  });

  it('swaps sort order with a neighbour', () => {
    const items = [
      { id: 'a', type: 'image' as const, url: '/a', poster: null, versions: [], alt: '', caption: '', sortOrder: 0 },
      { id: 'b', type: 'image' as const, url: '/b', poster: null, versions: [], alt: '', caption: '', sortOrder: 1 },
    ];
    expect(moveTile(items, 'a', 1)).toEqual([
      { id: 'a', sortOrder: 1 },
      { id: 'b', sortOrder: 0 },
    ]);
  });
});

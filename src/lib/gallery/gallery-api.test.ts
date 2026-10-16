import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
vi.mock('./gallery-assets', () => ({
  galleryAssets: { 'social-1': { url: '/bundled-1.jpg', versions: [] } },
}));

import { buildGalleryItems, moveTile, validateTileDraft, type GalleryRow } from './gallery-api';

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

describe('gallery', () => {
  it('orders tiles by sort order and resolves bundled media', () => {
    const items = buildGalleryItems([
      row({ id: 'b', sort_order: 2, media_url: '/up.webp' }),
      row({ id: 'a', sort_order: 1, asset_key: 'social-1' }),
    ]);
    expect(items.map((i) => [i.id, i.url])).toEqual([
      ['a', '/bundled-1.jpg'],
      ['b', '/up.webp'],
    ]);
  });

  it('hides a tile whose upload has not finished (no media yet)', () => {
    expect(buildGalleryItems([row({ id: 'empty' })])).toEqual([]);
  });

  it('requires a description for accessibility', () => {
    expect(validateTileDraft({ alt: ' ', caption: '' })).not.toBeNull();
    expect(validateTileDraft({ alt: 'Pasta', caption: 'Ciao' })).toBeNull();
  });

  it('moving a tile swaps it with its neighbour, and does nothing at the edge', () => {
    const items = buildGalleryItems([
      row({ id: 'a', sort_order: 1, media_url: '/a' }),
      row({ id: 'b', sort_order: 2, media_url: '/b' }),
    ]);
    expect(moveTile(items, 'b', -1)).toEqual([
      { id: 'b', sortOrder: 1 },
      { id: 'a', sortOrder: 2 },
    ]);
    expect(moveTile(items, 'a', -1)).toEqual([]);
  });
});

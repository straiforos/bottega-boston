import type { Json } from '@/lib/json';
import { galleryAssets } from './gallery-assets';
import type { GalleryItem, MediaVersion, TileDraft } from './types';

export type { GalleryItem, MediaVersion, TileDraft };

export interface GalleryRow {
  id: string;
  media_type: string;
  asset_key: string | null;
  media_url: string | null;
  poster_url: string | null;
  variants: Json | null;
  alt: string;
  caption: string;
  sort_order: number;
}

/** Pure mapper: orders tiles, resolves bundled media, and drops rows with nothing to show. */
export function buildGalleryItems(rows: GalleryRow[]): GalleryItem[] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((row) => {
      const bundled = row.asset_key ? galleryAssets[row.asset_key] : undefined;
      const versions = Array.isArray(row.variants) ? (row.variants as unknown as MediaVersion[]) : [];
      const url = row.media_url ?? bundled?.url;
      if (!url) return [];
      return [
        {
          id: row.id,
          type: row.media_type === 'video' ? ('video' as const) : ('image' as const),
          url,
          poster: row.poster_url ?? bundled?.poster ?? null,
          versions: versions.length ? versions : (bundled?.versions ?? []),
          alt: row.alt,
          caption: row.caption,
          sortOrder: row.sort_order,
        },
      ];
    });
}

export function validateTileDraft(draft: TileDraft): string | null {
  if (!draft.alt.trim()) return 'Describe the photo or video for people using screen readers.';
  if (draft.alt.length > 200) return 'Keep the description under 200 characters.';
  if (draft.caption.length > 60) return 'Keep the caption under 60 characters.';
  return null;
}

/** Swap positions with the neighbour in the given direction; returns the two updates to make. */
export function moveTile(items: readonly GalleryItem[], id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id);
  const other = items[index + direction];
  if (index < 0 || !other) return [];
  return [
    { id, sortOrder: other.sortOrder },
    { id: other.id, sortOrder: items[index].sortOrder },
  ];
}

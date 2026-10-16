import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { ProcessedMedia } from '@/lib/media/process-media';
import { galleryAssets } from './gallery-assets';
import type { GalleryItem, MediaVersion, TileDraft } from './types';

export const GALLERY_BUCKET = 'gallery-media';
const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;

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

async function fetchGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('id,media_type,asset_key,media_url,poster_url,variants,alt,caption,sort_order');
  if (error) throw error;
  return buildGalleryItems(data);
}

export const galleryQueryOptions = queryOptions({ queryKey: ['gallery'], queryFn: fetchGallery });

async function store(path: string, blob: Blob) {
  const upload = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
  if (upload.error) throw upload.error;
  const signed = await supabase.storage.from(GALLERY_BUCKET).createSignedUrl(path, TEN_YEARS_SECONDS);
  if (signed.error) throw signed.error;
  return signed.data.signedUrl;
}

/** Upload every processed version; returns the columns to write on the tile. */
export async function uploadTileMedia(tileId: string, media: ProcessedMedia) {
  const stamp = Date.now();
  const versions: MediaVersion[] = [];
  for (const version of media.versions) {
    const ext = version.blob.type === 'video/mp4' ? 'mp4' : version.blob.type === 'image/webp' ? 'webp' : 'jpg';
    versions.push({ key: version.key, width: version.width, url: await store(`${tileId}/${stamp}-${version.key}.${ext}`, version.blob) });
  }
  const poster = media.poster ? await store(`${tileId}/${stamp}-poster.jpg`, media.poster) : null;
  const standard = versions.find((v) => v.key === 'standard') ?? versions[0];
  return {
    media_type: media.kind,
    asset_key: null,
    media_url: standard.url,
    poster_url: poster,
    variants: versions as unknown as Json,
  };
}

export async function saveTile(id: string, draft: TileDraft, media?: Awaited<ReturnType<typeof uploadTileMedia>>) {
  const { error } = await supabase
    .from('gallery_items')
    .update({ alt: draft.alt.trim(), caption: draft.caption.trim(), updated_at: new Date().toISOString(), ...media })
    .eq('id', id);
  if (error) throw error;
}

export async function createTile(sortOrder: number) {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert({ sort_order: sortOrder, alt: '', caption: '' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteTile(id: string) {
  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) throw error;
}

export async function setTileOrder(updates: { id: string; sortOrder: number }[]) {
  for (const update of updates) {
    const { error } = await supabase.from('gallery_items').update({ sort_order: update.sortOrder }).eq('id', update.id);
    if (error) throw error;
  }
}

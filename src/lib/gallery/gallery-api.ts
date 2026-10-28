import { queryOptions } from '@tanstack/react-query';
import type { ProcessedMedia } from '@/lib/media/process-media';
import { uploadBlob } from '@/lib/r2/upload-client';
import {
  createTile as createTileFn,
  deleteTile as deleteTileFn,
  fetchGallery,
  saveTile as saveTileFn,
  setTileOrder as setTileOrderFn,
} from './gallery.functions';
import { buildGalleryItems, moveTile, validateTileDraft, type MediaVersion, type TileDraft } from './gallery-shared';

export { buildGalleryItems, moveTile, validateTileDraft };
export type { GalleryRow } from './gallery-shared';
export const GALLERY_PREFIX = 'gallery-media';

export const galleryQueryOptions = queryOptions({ queryKey: ['gallery'], queryFn: () => fetchGallery() });

/** Upload every processed version; returns the columns to write on the tile. */
export async function uploadTileMedia(tileId: string, media: ProcessedMedia) {
  const stamp = Date.now();
  const versions: MediaVersion[] = [];
  for (const version of media.versions) {
    const ext = version.blob.type === 'video/mp4' ? 'mp4' : version.blob.type === 'image/webp' ? 'webp' : 'jpg';
    const key = `${GALLERY_PREFIX}/${tileId}/${stamp}-${version.key}.${ext}`;
    versions.push({ key: version.key, width: version.width, url: await uploadBlob(key, version.blob) });
  }
  const poster = media.poster
    ? await uploadBlob(`${GALLERY_PREFIX}/${tileId}/${stamp}-poster.jpg`, media.poster)
    : null;
  const standard = versions.find((v) => v.key === 'standard') ?? versions[0];
  return {
    media_type: media.kind,
    asset_key: null as null,
    media_url: standard.url,
    poster_url: poster,
    variants: versions,
  };
}

export async function saveTile(id: string, draft: TileDraft, media?: Awaited<ReturnType<typeof uploadTileMedia>>) {
  await saveTileFn({ data: { id, draft, media } });
}

export async function createTile(sortOrder: number) {
  const { id } = await createTileFn({ data: { sortOrder } });
  return id;
}

export async function deleteTile(id: string) {
  await deleteTileFn({ data: id });
}

export async function setTileOrder(updates: { id: string; sortOrder: number }[]) {
  await setTileOrderFn({ data: updates });
}

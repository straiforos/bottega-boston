import { useQueryClient } from '@tanstack/react-query';
import {
  createTile,
  deleteTile,
  galleryQueryOptions,
  moveTile,
  saveTile,
  setTileOrder,
  uploadTileMedia,
} from '@/lib/gallery/gallery-api';
import type { GalleryItem, TileDraft } from '@/lib/gallery/types';

type Progress = (fraction: number) => void;

/** Staff gallery actions; each refreshes the live gallery. Permission is enforced by the database. */
export function useGalleryAdmin() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: galleryQueryOptions.queryKey });

  const prepare = async (id: string, file: File, onProgress: Progress) => {
    const { processMedia } = await import('@/lib/media/process-media');
    const processed = await processMedia(file, onProgress);
    return uploadTileMedia(id, processed);
  };

  return {
    async update(id: string, draft: TileDraft, file: File | null, onProgress: Progress) {
      await saveTile(id, draft, file ? await prepare(id, file, onProgress) : undefined);
      await refresh();
    },
    async create(draft: TileDraft, file: File, sortOrder: number, onProgress: Progress) {
      const id = await createTile(sortOrder);
      try {
        await saveTile(id, draft, await prepare(id, file, onProgress));
      } catch (error) {
        await deleteTile(id).catch(() => undefined);
        throw error;
      }
      await refresh();
    },
    async remove(id: string) {
      await deleteTile(id);
      await refresh();
    },
    async move(items: readonly GalleryItem[], id: string, direction: -1 | 1) {
      await setTileOrder(moveTile(items, id, direction));
      await refresh();
    },
  };
}

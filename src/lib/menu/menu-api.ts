import { queryOptions } from '@tanstack/react-query';
import { processDishPhoto } from '@/lib/media/process-image';
import { uploadBlob } from '@/lib/r2/upload-client';
import {
  addDish as addDishFn,
  deleteDish as deleteDishFn,
  fetchMenu,
  saveDish as saveDishFn,
} from './menu.functions';
import { buildMenuSections, validateDishDraft, type DishDraft, type ImageVariant, type UploadedImage } from './menu-shared';

export { buildMenuSections, validateDishDraft };
export type { DishDraft, ImageVariant, UploadedImage };
export const MENU_IMAGE_PREFIX = 'menu-images';

export const menuQueryOptions = queryOptions({ queryKey: ['menu'], queryFn: () => fetchMenu() });

/** Processes the photo in the browser, then stores every version on R2. */
export async function uploadDishImage(dishId: string, file: File): Promise<UploadedImage> {
  const processed = await processDishPhoto(file);
  const stamp = Date.now();
  const variants: ImageVariant[] = [];
  for (const version of processed) {
    const ext = version.blob.type === 'image/webp' ? 'webp' : 'jpg';
    const key = `${MENU_IMAGE_PREFIX}/${dishId}/${stamp}-${version.key}.${ext}`;
    const url = await uploadBlob(key, version.blob);
    variants.push({ key: version.key, url, width: version.width });
  }
  const standard = variants.find((v) => v.key === 'standard') ?? variants[0];
  return { url: standard.url, variants };
}

export async function saveDish(dishId: string, draft: DishDraft, image?: UploadedImage) {
  await saveDishFn({ data: { dishId, draft, image } });
}

export async function addDish(sectionId: string, draft: DishDraft, sortOrder: number, file?: File | null) {
  const { id } = await addDishFn({ data: { sectionId, draft, sortOrder } });
  if (file) await saveDish(id, draft, await uploadDishImage(id, file));
}

export async function deleteDish(dishId: string) {
  await deleteDishFn({ data: dishId });
}

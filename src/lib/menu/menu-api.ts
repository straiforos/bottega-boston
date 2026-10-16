import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { processDishPhoto } from '@/lib/media/process-image';
import type { DishDraft, ImageVariant, MenuSection } from './types';

export const MENU_IMAGE_BUCKET = 'menu-images';
const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;

interface SectionRow {
  id: string;
  name: string;
  note: string;
  sort_order: number;
}
interface ItemRow {
  id: string;
  section_id: string;
  name: string;
  price: string;
  description: string;
  tags: string[];
  image_url: string | null;
  image_variants?: Json | null;
  sort_order: number;
}

/** Pure mapper so ordering/grouping rules are testable without the network. */
export function buildMenuSections(sections: SectionRow[], items: ItemRow[]): MenuSection[] {
  return [...sections]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((section) => ({
      id: section.id,
      name: section.name,
      note: section.note,
      items: items
        .filter((item) => item.section_id === section.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          tags: item.tags,
          imageUrl: item.image_url,
          imageVariants: Array.isArray(item.image_variants) ? (item.image_variants as unknown as ImageVariant[]) : null,
        })),
    }));
}

export function validateDishDraft(draft: DishDraft): string | null {
  if (!draft.name.trim()) return 'Give the dish a name.';
  if (draft.name.trim().length > 120) return 'Keep the name under 120 characters.';
  if (draft.price.length > 120) return 'Keep the price under 120 characters.';
  if (draft.description.length > 3000) return 'Keep the description under 3000 characters.';
  return null;
}

async function fetchMenu(): Promise<MenuSection[]> {
  const [sections, items] = await Promise.all([
    supabase.from('menu_sections').select('id,name,note,sort_order'),
    supabase.from('menu_items').select('id,section_id,name,price,description,tags,image_url,image_variants,sort_order'),
  ]);
  if (sections.error) throw sections.error;
  if (items.error) throw items.error;
  return buildMenuSections(sections.data, items.data);
}

export const menuQueryOptions = queryOptions({ queryKey: ['menu'], queryFn: fetchMenu });

export interface UploadedImage {
  readonly url: string;
  readonly variants: ImageVariant[];
}

/** Processes the photo in the browser, then stores every version. */
export async function uploadDishImage(dishId: string, file: File): Promise<UploadedImage> {
  const processed = await processDishPhoto(file);
  const stamp = Date.now();
  const variants: ImageVariant[] = [];
  for (const version of processed) {
    const ext = version.blob.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${dishId}/${stamp}-${version.key}.${ext}`;
    const upload = await supabase.storage
      .from(MENU_IMAGE_BUCKET)
      .upload(path, version.blob, { contentType: version.blob.type, cacheControl: '31536000' });
    if (upload.error) throw upload.error;
    const signed = await supabase.storage.from(MENU_IMAGE_BUCKET).createSignedUrl(path, TEN_YEARS_SECONDS);
    if (signed.error) throw signed.error;
    variants.push({ key: version.key, url: signed.data.signedUrl, width: version.width });
  }
  const standard = variants.find((v) => v.key === 'standard') ?? variants[0];
  return { url: standard.url, variants };
}

export async function saveDish(dishId: string, draft: DishDraft, image?: UploadedImage) {
  const { error } = await supabase
    .from('menu_items')
    .update({
      name: draft.name.trim(),
      price: draft.price.trim(),
      description: draft.description.trim(),
      tags: [...draft.tags],
      updated_at: new Date().toISOString(),
      ...(image ? { image_url: image.url, image_variants: image.variants as unknown as Json } : {}),
    })
    .eq('id', dishId);
  if (error) throw error;
}

export async function addDish(sectionId: string, draft: DishDraft, sortOrder: number, file?: File | null) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      section_id: sectionId,
      name: draft.name.trim(),
      price: draft.price.trim(),
      description: draft.description.trim(),
      tags: [...draft.tags],
      sort_order: sortOrder,
    })
    .select('id')
    .single();
  if (error) throw error;
  if (file) await saveDish(data.id, draft, await uploadDishImage(data.id, file));
}

export async function deleteDish(dishId: string) {
  const { error } = await supabase.from('menu_items').delete().eq('id', dishId);
  if (error) throw error;
}

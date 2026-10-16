import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DishDraft, MenuSection } from './types';

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
    supabase.from('menu_items').select('id,section_id,name,price,description,tags,image_url,sort_order'),
  ]);
  if (sections.error) throw sections.error;
  if (items.error) throw items.error;
  return buildMenuSections(sections.data, items.data);
}

export const menuQueryOptions = queryOptions({ queryKey: ['menu'], queryFn: fetchMenu });

export async function uploadDishImage(dishId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${dishId}/${Date.now()}.${ext}`;
  const upload = await supabase.storage.from(MENU_IMAGE_BUCKET).upload(path, file, { contentType: file.type });
  if (upload.error) throw upload.error;
  const signed = await supabase.storage.from(MENU_IMAGE_BUCKET).createSignedUrl(path, TEN_YEARS_SECONDS);
  if (signed.error) throw signed.error;
  return signed.data.signedUrl;
}

export async function saveDish(dishId: string, draft: DishDraft, imageUrl?: string) {
  const { error } = await supabase
    .from('menu_items')
    .update({
      name: draft.name.trim(),
      price: draft.price.trim(),
      description: draft.description.trim(),
      updated_at: new Date().toISOString(),
      ...(imageUrl ? { image_url: imageUrl } : {}),
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

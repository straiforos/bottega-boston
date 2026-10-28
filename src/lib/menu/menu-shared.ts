import type { Json } from '@/lib/json';
import type { DishDraft, ImageVariant, MenuSection } from './types';

export type { DishDraft, ImageVariant, MenuSection };

export interface SectionRow {
  id: string;
  name: string;
  note: string;
  sort_order: number;
}
export interface ItemRow {
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

export interface UploadedImage {
  readonly url: string;
  readonly variants: ImageVariant[];
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

export interface MenuItem {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly description: string;
  readonly tags: readonly string[];
  /** Staff/DB photo URL; omit or null when the dish has no image. */
  readonly imageUrl?: string | null;
  readonly imageVariants?: readonly ImageVariant[] | null;
}

export interface ImageVariant {
  readonly key: 'thumb' | 'standard' | 'hq';
  readonly url: string;
  readonly width: number;
}

export interface MenuSection {
  readonly id: string;
  readonly name: string;
  readonly note: string;
  readonly items: readonly MenuItem[];
}

export interface DishDraft {
  readonly name: string;
  readonly price: string;
  readonly description: string;
  readonly tags: readonly string[];
}

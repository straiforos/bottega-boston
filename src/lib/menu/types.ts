export interface MenuItem {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly description: string;
  readonly tags: readonly string[];
  /** Uploaded photo; when absent the bundled illustrative image for the id is used. */
  readonly imageUrl?: string | null;
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
}

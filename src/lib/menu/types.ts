export interface MenuItem {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly description: string;
  readonly tags: readonly string[];
}

export interface MenuSection {
  readonly id: string;
  readonly name: string;
  readonly note: string;
  readonly items: readonly MenuItem[];
}
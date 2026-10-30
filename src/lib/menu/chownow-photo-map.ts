/** Hand-checked dining dish → ChowNow item name. Catering and ambiguous dishes stay out. */
export const CHOWNOW_PHOTO_MAP: Readonly<Record<string, string>> = {
  // Coffee & Tea
  'dish-0': 'Espresso | #1',
  'dish-1': 'Double Espresso | #1',
  'dish-2': 'Machiatto',
  'dish-3': 'Americano | #1',
  'dish-4': 'Cappuccino',
  'dish-5': 'Latte | #1',
  'dish-6': 'Tea.',
  'dish-7': 'Iced Americano',
  'dish-8': 'Iced Latte',
  // Breakfast
  'dish-9': 'Frittata Plain | #1',
  'dish-10': 'Frittata Sausage and Ricotta',
  'dish-11': 'Frittata Ham and Cheese',
  'dish-13': 'Breakfast Bruschetta',
  'dish-14': 'Bruschetta Dolce | #1',
  'dish-15': 'Breakfast Panini',
  'dish-16': 'Sflogliatella Ham and Cheese | #2',
  // Antipasti
  'dish-17': 'Bruschetta | #1',
  'dish-18': 'Sflogliatella Spinach',
  'dish-19': 'Chicken Croquettes',
  'dish-20': 'Sausage Arancini | #1',
  'dish-21': 'Sflogliatella Ham and Cheese | #1',
  // Insalate
  'dish-22': 'Caprese Salad',
  'dish-23': 'Insalata di Cesare',
  'dish-24': 'Toscana',
  'dish-25': 'Pear and Parmigiano',
  // Al Forno
  'dish-26': 'Parmigiana Di Melanzane',
  'dish-27': 'Lasagne Alla Bolognese',
  'dish-28': 'Chicken Parm Dinner',
  // Panini
  'dish-30': 'Bottega Panino',
  'dish-31': 'Italiano Sandwich',
  'dish-32': 'Meatball Panino',
  'dish-33': 'Roast Beef Panino',
  'dish-34': 'Caprese Sandwich',
  'dish-35': 'Tacchino Panino',
  'dish-36': 'Melanzane',
  'dish-37': 'Chicken Parm Panino',
  'dish-38': 'Morta-Della',
  // Pasta
  'dish-41': 'Pumpkin Tortelloni',
  // Dolci
  'dish-42': 'Tiramisu',
  'dish-43': 'Bread Pudim',
  'dish-44': 'Cannoli Large',
  'dish-45': 'Nutella Cannoli',
  'dish-46': 'Nuvole',
  'dish-47': 'Cannollo di Pistacchio',
  'dish-48': 'Triple Chocolate Cake | #1',
  'dish-49': 'Italian Cookie',
  'dish-50': 'Limoncello cake',
};

export interface ChowNowMenuItem {
  readonly name: string;
  readonly imageUrl: string;
}

export interface ResolvedChowNowPhoto {
  readonly dishId: string;
  readonly chowNowName: string;
  readonly imageUrl: string;
}

export interface SiteDishRef {
  readonly id: string;
  readonly name: string;
  readonly sectionName: string;
}

/** Resolves each mapped dish to a photo URL; fails on a missing or conflicting name. */
export function resolveChowNowPhotos(
  map: Readonly<Record<string, string>>,
  items: readonly ChowNowMenuItem[],
): ResolvedChowNowPhoto[] {
  const byName = new Map<string, string[]>();
  for (const item of items) {
    if (!item.imageUrl) continue;
    const urls = byName.get(item.name) ?? [];
    urls.push(item.imageUrl);
    byName.set(item.name, urls);
  }

  const out: ResolvedChowNowPhoto[] = [];
  for (const [dishId, chowNowName] of Object.entries(map)) {
    const urls = byName.get(chowNowName);
    if (!urls?.length) {
      throw new Error(`ChowNow item not found or has no photo: ${JSON.stringify(chowNowName)} (for ${dishId})`);
    }
    const unique = [...new Set(urls)];
    if (unique.length > 1) {
      throw new Error(
        `ChowNow item ${JSON.stringify(chowNowName)} has conflicting photo URLs for ${dishId}`,
      );
    }
    out.push({ dishId, chowNowName, imageUrl: unique[0] });
  }
  return out;
}

/** Every mapped id must exist on the dining menu, never under a Catering section. */
export function assertMapMatchesDiningMenu(
  map: Readonly<Record<string, string>>,
  dishes: readonly SiteDishRef[],
): void {
  const byId = new Map(dishes.map((d) => [d.id, d]));
  for (const dishId of Object.keys(map)) {
    const dish = byId.get(dishId);
    if (!dish) throw new Error(`Mapped dish id missing from site menu: ${dishId}`);
    if (dish.sectionName.startsWith('Catering')) {
      throw new Error(`Mapped dish ${dishId} belongs to catering section ${dish.sectionName}`);
    }
  }
}

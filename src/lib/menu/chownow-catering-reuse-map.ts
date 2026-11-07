/**
 * Catering dishes that reuse an already-polished dining photo as the Gemini
 * input, with a tray/platter presentation tweak. Keys are catering dish ids.
 */
export type CateringPresentation =
  | 'salad-tray'
  | 'baked-tray'
  | 'panini-tray'
  | 'bites-tray'
  | 'breakfast-tray'
  | 'dessert-tray'
  | 'dessert-box';

export interface CateringReuseSpec {
  readonly sourceDishId: string;
  readonly presentation: CateringPresentation;
  /** Extra Gemini guidance for this dish beyond the presentation template. */
  readonly adaptHint?: string;
  /**
   * When true, feed `{sourceDishId}-source.jpg` (ChowNow original) instead of the
   * polished dining studio file—useful when pastry cut geometry must stay exact.
   */
  readonly useRawSource?: boolean;
}

const FRITTATA_TRAY_HINT =
  'One continuous frittata baked in a full metal hotel pan, scored into a neat grid of equal squares still sitting in the pan—not separate plated pieces. Lightly scatter arugula across the top evenly; no big bunches piled on individual squares.';

const PANINI_HOTEL_HINT =
  'Sandwiches must sit inside a rectangular metal catering hotel pan (same style as the other panini trays). Pan on the warm-stone countertop. No marble surface, no parchment paper sheet as the base, no single plate.';

export const CHOWNOW_CATERING_REUSE_MAP: Readonly<Record<string, CateringReuseSpec>> = {
  // Insalate trays
  'dish-51': { sourceDishId: 'dish-23', presentation: 'salad-tray' },
  'dish-52': { sourceDishId: 'dish-24', presentation: 'salad-tray' },
  'dish-53': { sourceDishId: 'dish-25', presentation: 'salad-tray' },
  'dish-54': { sourceDishId: 'dish-22', presentation: 'salad-tray' },
  // Al Forno trays
  'dish-55': {
    sourceDishId: 'dish-26',
    presentation: 'baked-tray',
    adaptHint:
      'Vessel MUST be a rectangular stainless-steel catering hotel pan (gastronorm / steam-table pan) with a rolled metal rim—NOT a disposable crimped aluminum foil takeout tray, NOT ceramic, NOT a single plate. Full pan of Parmigiana di Melanzane scored into a neat grid of servings, cheese browned on top.',
  },
  'dish-56': { sourceDishId: 'dish-27', presentation: 'baked-tray' },
  // Panini trays
  'dish-71': { sourceDishId: 'dish-30', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  'dish-72': { sourceDishId: 'dish-33', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  'dish-73': { sourceDishId: 'dish-36', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  'dish-74': { sourceDishId: 'dish-31', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  'dish-75': { sourceDishId: 'dish-34', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  'dish-76': { sourceDishId: 'dish-37', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  'dish-77': { sourceDishId: 'dish-32', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  'dish-78': { sourceDishId: 'dish-35', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  'dish-79': { sourceDishId: 'dish-38', presentation: 'panini-tray', adaptHint: PANINI_HOTEL_HINT },
  // Sides / bites
  'dish-83': { sourceDishId: 'dish-17', presentation: 'bites-tray' },
  'dish-84': {
    sourceDishId: 'dish-18',
    presentation: 'bites-tray',
    // Prefer polished dining shape (already correct halved pockets) over raw interior chaos.
    useRawSource: false,
    adaptHint:
      'ONLY change scale: put many identical copies of THIS exact pastry into a metal hotel pan. Each piece must stay a reclining triangular HALVED pocket with a curved outer rim and an open cut face showing green filling—same silhouette as the source on the plate. Do NOT redesign into vertical slices, strudel wedges, sealed turnovers, flat bars, or standing cut logs. Same pastry, more of them, in a hotel pan on warm-stone.',
  },
  'dish-85': { sourceDishId: 'dish-19', presentation: 'bites-tray' },
  'dish-86': { sourceDishId: 'dish-20', presentation: 'bites-tray' },
  // Breakfast catering
  'dish-87': { sourceDishId: 'dish-15', presentation: 'breakfast-tray' },
  'dish-88': { sourceDishId: 'dish-13', presentation: 'breakfast-tray' },
  'dish-89': { sourceDishId: 'dish-9', presentation: 'breakfast-tray', adaptHint: FRITTATA_TRAY_HINT },
  'dish-90': { sourceDishId: 'dish-10', presentation: 'breakfast-tray', adaptHint: FRITTATA_TRAY_HINT },
  'dish-91': { sourceDishId: 'dish-11', presentation: 'breakfast-tray', adaptHint: FRITTATA_TRAY_HINT },
  // Dolci trays
  'dish-94': { sourceDishId: 'dish-42', presentation: 'dessert-tray' },
  'dish-95': { sourceDishId: 'dish-44', presentation: 'dessert-box' },
  'dish-96': {
    // Reuse the polished cannoli-box tray so layout matches dish-95; restyle fillings to Nutella.
    sourceDishId: 'dish-95',
    presentation: 'dessert-box',
    adaptHint:
      'Keep this exact same open white cardboard cannoli catering box and packing layout. Change every pastry to Nutella cannoli (chocolate-hazelnut filling, same shell style). Do not switch to a plate or different box.',
  },
  'dish-97': { sourceDishId: 'dish-46', presentation: 'dessert-tray' },
  'dish-98': {
    sourceDishId: 'dish-43',
    presentation: 'dessert-tray',
    adaptHint:
      'One uniform bread pudding baked in a full hotel pan (continuous slab, not separate ramekins). A serving spoon is lifting/splitting one scoop from the tray so the cut edge shows.',
  },
};

export function cateringPresentationHint(presentation: CateringPresentation): string {
  switch (presentation) {
    case 'salad-tray':
      return 'Show a deep full-size catering hotel pan or oversized bowl heaped for 14–16 people—clearly a large tray, not a single salad plate.';
    case 'baked-tray':
      return 'Show a full-size rectangular stainless-steel catering hotel pan (not disposable foil) packed with the baked dish for 8–12 people, scored into many servings.';
    case 'panini-tray':
      return 'Show a rectangular metal catering hotel pan packed with many halves of the same sandwich (a dozen-plus), party-tray density. Pan rests on warm-stone—never marble, parchment, or a dinner plate.';
    case 'bites-tray':
      return 'Show a large catering tray densely filled with dozens of the same bite-sized pieces for a group platter.';
    case 'breakfast-tray':
      return 'Show a full metal hotel pan of the breakfast item for office catering—uniform tray presentation, not scattered separate plates.';
    case 'dessert-tray':
      return 'Show a large catering dessert hotel pan or sheet with a uniform dessert for 12–15 people.';
    case 'dessert-box':
      return 'Show a large open white cardboard pastry box packed with many pieces of the same dessert—bulk cannoli-style box, not one pastry on a plate.';
  }
}

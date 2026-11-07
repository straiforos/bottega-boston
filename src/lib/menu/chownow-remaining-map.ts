/**
 * Remaining dishes with a usable ChowNow (or dining-polished) photo feed.
 * Pasta trays reuse a pasta plate source; Gemini restyles sauce + hotel-pan qty.
 */
export type RemainingPresentation =
  | 'studio'
  | 'pasta-tray'
  | 'topping-tray'
  | 'focaccia-tray'
  | 'coffee-catering'
  | 'soup'
  | 'pasta-bowl'
  | 'sauce-pints';

export interface RemainingPhotoSpec {
  /** Exact ChowNow item name used to download the source photo. */
  readonly chowNowName: string;
  readonly presentation: RemainingPresentation;
  /** Optional sauce / plating guidance when the ChowNow dish is only a base. */
  readonly adaptHint?: string;
}

export const CHOWNOW_REMAINING_MAP: Readonly<Record<string, RemainingPhotoSpec>> = {
  // Dining leftovers
  'dish-12': {
    chowNowName: 'Sflogliatella Spinach',
    presentation: 'studio',
    adaptHint: 'Breakfast sfogliatelle pastry; spinach and cheese filling is fine as the hero.',
  },
  'dish-29': {
    chowNowName: 'Creamy Minestrone soup',
    presentation: 'soup',
    adaptHint: 'Present as a generic Soup of the Day bowl—keep it looking like a house Italian soup.',
  },
  'dish-39': {
    chowNowName: 'Penne',
    presentation: 'pasta-bowl',
    adaptHint:
      'Single build-your-own pasta bowl with penne in a bright pomodoro (tomato-basil) sauce, lightly finished with cheese.',
  },
  'dish-40': {
    chowNowName: 'Mini Pasta ( Only Tomato, Fedora, Bolognese)',
    presentation: 'sauce-pints',
    adaptHint:
      'Show several clear plastic takeout pints of different house pasta sauces (red, creamy pink, cream, pesto green) on the counter—not a plated pasta.',
  },

  // Pasta catering trays — Penne base; sauce restyle per house recipe
  'dish-57': {
    chowNowName: 'Mini Pasta ( Only Tomato, Fedora, Bolognese)',
    presentation: 'pasta-tray',
    adaptHint: 'Pomodoro: fresh tomato and basil. Full hotel pan of penne for 12–15.',
  },
  'dish-58': {
    chowNowName: 'Mini Pasta ( Only Tomato, Fedora, Bolognese)',
    presentation: 'pasta-tray',
    adaptHint: 'Fedora: pomodoro with rosemary and cream (rosy tomato-cream). Full hotel pan of penne for 12–15.',
  },
  'dish-59': {
    chowNowName: 'Penne',
    presentation: 'pasta-tray',
    adaptHint: 'Vodka: creamy pink vodka sauce with a touch of butter. Full hotel pan for 12–15.',
  },
  'dish-60': {
    chowNowName: 'Fettuccine',
    presentation: 'pasta-tray',
    adaptHint: 'Creamy Carbonara: egg, cheese, cream, pancetta, onion, black pepper. Full hotel pan for 12–15.',
  },
  'dish-61': {
    chowNowName: 'Fettuccine',
    presentation: 'pasta-tray',
    adaptHint: 'Alfredo: butter, cheese, cream, black pepper. Full hotel pan for 12–15.',
  },
  'dish-62': {
    chowNowName: 'Spaghetti',
    presentation: 'pasta-tray',
    adaptHint: 'Amatricciana: tomato sauce with cured pork and pecorino. Full hotel pan for 12–15.',
  },
  'dish-63': {
    chowNowName: 'Mini Pasta ( Only Tomato, Fedora, Bolognese)',
    presentation: 'pasta-tray',
    adaptHint: 'Bolognese: ground beef and pork cooked in pomodoro. Full hotel pan of penne for 12–15.',
  },
  'dish-64': {
    chowNowName: 'Penne',
    presentation: 'pasta-tray',
    adaptHint: 'Michelangelo: fresh tomato, basil, and fresh mozzarella. Full hotel pan for 12–15.',
  },
  'dish-65': {
    chowNowName: 'Fettuccine',
    presentation: 'pasta-tray',
    adaptHint: 'Andrea: cream sauce with prosciutto, sweet peas, mushroom, hint of truffle oil. Full hotel pan for 12–15.',
  },
  'dish-66': {
    chowNowName: 'Penne',
    presentation: 'pasta-tray',
    adaptHint: 'Pesto: fresh basil, parmigiano, EVOO, garlic, pine nuts—green pesto coating. Full hotel pan for 12–15.',
  },
  'dish-67': {
    chowNowName: 'Penne',
    presentation: 'pasta-tray',
    adaptHint:
      'Arrabbiata: spicy tomato sauce with chili heat on penne in a full hotel pan for 12–15. Natural loose penne coated in sauce—no spaghetti nests, no artistic twirls, no fake swirl mounds; keep pasta looking like a real scooped catering tray.',
  },
  'dish-68': {
    chowNowName: 'Penne',
    presentation: 'pasta-tray',
    adaptHint: 'Medici: prosciutto and mushroom in creamy pomodoro. Full hotel pan for 12–15.',
  },
  'dish-69': {
    chowNowName: 'Fettuccine',
    presentation: 'pasta-tray',
    adaptHint: 'Pesce: shrimp, scallops, sundried tomato, white wine and thyme. Full hotel pan for 12–15.',
  },
  'dish-70': {
    chowNowName: 'Penne',
    presentation: 'pasta-tray',
    adaptHint: 'Gorgonzola: creamy blue cheese sauce with a touch of nutmeg. Full hotel pan for 12–15.',
  },

  // Toppings / sides / coffee catering
  'dish-80': {
    chowNowName: 'Polpetti/meatballs',
    presentation: 'topping-tray',
    adaptHint:
      'Large catering tray of Italian meatballs with grilled chicken pieces and roasted sausage for a toppings tray.',
  },
  'dish-81': {
    chowNowName: 'Vegetable Panino',
    presentation: 'topping-tray',
    adaptHint:
      'Full metal hotel pan of pasta toppings only: roasted broccoli florets, sautéed mushrooms, and roasted red peppers—abundant mixed vegetable tray. No sandwich bread, no greens salad, no cheese plate.',
  },
  'dish-82': {
    chowNowName: 'Focaccia Olives',
    presentation: 'focaccia-tray',
    adaptHint: 'House focaccia tray—large catering tray of focaccia squares (rosemary/olive style is fine).',
  },
  'dish-92': {
    chowNowName: 'Americano | #1',
    presentation: 'coffee-catering',
    adaptHint: 'Large insulated catering coffee urn / airpot of hot black coffee sized for ~16 cups—not a single mug.',
  },
  'dish-93': {
    chowNowName: 'Iced Americano',
    presentation: 'coffee-catering',
    adaptHint: 'Large clear catering dispenser of iced black coffee for ~16 servings—not a single cup.',
  },
};

export function remainingPresentationHint(presentation: RemainingPresentation): string {
  switch (presentation) {
    case 'studio':
      return 'Keep a single-portion studio product shot on the warm-stone countertop.';
    case 'soup':
      return 'Show a ceramic bowl of soup on the warm-stone countertop, studio lit.';
    case 'pasta-bowl':
      return 'Show one composed pasta bowl, single serving, studio product shot.';
    case 'sauce-pints':
      return 'Show multiple takeout pint containers of sauces—bulk sauce retail, not plated pasta.';
    case 'pasta-tray':
      return 'Show a FULL-SIZE catering hotel pan heaped with pasta for 12–15 people—never a single bowl or plate. Pasta should look naturally tossed in sauce (loose tubes or strands), not stylized swirls, nests, or CGI twirls.';
    case 'topping-tray':
      return 'Show a large catering tray densely filled with the protein toppings for a crowd.';
    case 'focaccia-tray':
      return 'Show a large catering tray of focaccia pieces for a group.';
    case 'coffee-catering':
      return 'Show bulk catering beverage service for ~16 people, not a single drink.';
  }
}

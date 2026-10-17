export const restaurantContent = {
  home: {
    welcome: 'Benvenuti',
    pastaIsLife: 'Pasta is life',
    familyIsLife: 'Family is life',
    events: 'Bottega events',
    menu: {
      title: 'Menu',
      action: 'View menu',
    },
  },
  navigation: {
    homeLabel: 'Bottega home',
    menuLabel: 'Main navigation',
    story: 'Our story',
    menu: 'Menu',
    events: 'Come hang out',
    order: 'Order now ↗',
    emailBuilder: 'Email builder',
  },
  metadata: {
    home: {
      title: 'Bottega — Buonissima. Semplice. Italian.',
      description:
        'Welcome to Bottega Pasta Club. Meet, eat, and celebrate life with pasta, coffee, and a little Italian joy in Brookline and Boston.',
      socialDescription: 'Judgment-free and full of carbs. Discover Bottega’s menu, Pasta Club, and Italian market.',
    },
    menu: {
      title: 'Bottega Menu — Pasta, Panini, Dolci & Catering',
      description:
        'Explore Bottega Fiorentina’s full menu: coffee, breakfast, antipasti, salads, panini, customizable pasta, Italian sweets and catering trays, with prices and dietary labels.',
      socialDescription:
        'Find your next Bottega favorite. Browse the complete Italian menu and catering selection with illustrative dish images.',
    },
  },
  ordering: {
    title: 'Our locations',
    mapLabel: 'Map of',
    orderFrom: 'Order from',
  },
  addresses: [
    { name: 'Bottega Fioretina', lines: ['313B Harvard St.', 'Brookline, MA 02446'] },
    { name: 'Bottega Del Sud', lines: ['645 E 2nd St.', 'Boston, MA 02127'] },
  ],
  hours: [
    { label: 'Monday to Friday', value: '7:30 am – 9:00 pm' },
    { label: 'Weekends', value: '9:30 am – 9:00 pm' },
  ],
  legal: [
    { label: 'Privacy policy', path: 'privecy-policy' },
    { label: 'Accessibility', path: 'accessibility-statement' },
    { label: 'Terms & conditions', path: 'terms-and-conditions' },
    { label: 'Refund policy', path: 'refund-policy' },
  ],
  media: {
    play: 'Play video',
    pause: 'Pause video',
    soundOn: 'Turn sound on',
    soundOff: 'Turn sound off',
    captionsOn: 'Show captions',
    captionsOff: 'Hide captions',
    galleryPrev: 'Previous photos',
    galleryNext: 'More photos',
  },
} as const;

export type RestaurantContent = typeof restaurantContent;

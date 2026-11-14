export const restaurantContent = {
  comingSoon: {
    message: 'Coming soon. For the live site and ordering, visit',
    linkLabel: 'eatbottega.com',
  },
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
  menuPage: {
    stamp: 'Buon\nappetito',
    title: 'Bottega menu',
    lead: 'Pasta, panini & a little dolce vita.',
  },
  navigation: {
    homeLabel: 'Bottega home',
    menuLabel: 'Main navigation',
    story: 'Our story',
    menu: 'Menu',
    events: 'Come hang out',
    order: 'Order now ↗',
    siteAdmin: 'Site Admin',
    emails: 'Emails',
    adminEvents: 'Events',
    adminAnnouncements: 'Announcements',
    adminRequests: 'Requests',
  },
  metadata: {
    home: {
      title: 'Bottega | Buonissima. Semplice. Italian.',
      description:
        'Welcome to Bottega Pasta Club. Meet, eat, and celebrate life with pasta, coffee, and a little Italian joy in Brookline and Boston.',
      socialDescription: 'Judgment-free and full of carbs. Discover Bottega’s menu, Pasta Club, and Italian market.',
    },
    menu: {
      title: 'Bottega Menu | Pasta, Panini, Dolci & Catering',
      description:
        'Explore Bottega Fiorentina’s full menu: coffee, breakfast, antipasti, salads, panini, customizable pasta, Italian sweets and catering trays, with prices and dietary labels.',
      socialDescription:
        'Find your next Bottega favorite. Browse the complete Italian menu and catering selection with illustrative dish images.',
    },
    order: {
      title: 'Order now | Bottega Brookline & Boston',
      description:
        'Order Bottega online for pickup or delivery from Bottega Fiorentina in Brookline or Bottega Del Sud in South Boston.',
      socialDescription: 'Pick your Bottega shop and order pasta, panini, and more for pickup or delivery.',
    },
    catering: {
      title: 'Catering | Bottega Italian trays for your crowd',
      description:
        'Order Bottega catering: pasta, al forno, panini, salads and dolci trays for pickup or delivery in Brookline and Boston.',
      socialDescription: 'Build your Bottega catering order and we’ll confirm the details.',
    },
    eventsRequest: {
      title: 'Host your event at Bottega | private parties',
      description:
        'Request Bottega’s space for birthdays, showers and team dinners, with optional Italian catering.',
      socialDescription: 'Tell us about your party and we’ll check availability.',
    },
  },
  orderPage: {
    title: 'Order now',
    lead: 'Pickup or delivery from Brookline or South Boston.',
  },
  ordering: {
    title: 'Our locations',
    mapLabel: 'Map of',
    orderFrom: 'Order from',
    orderNow: 'Order now',
  },
  addresses: [
    { name: 'Bottega Fioretina', lines: ['313B Harvard St.', 'Brookline, MA 02446'] },
    { name: 'Bottega Del Sud', lines: ['645 E 2nd St.', 'Boston, MA 02127'] },
  ],
  hours: [
    { label: 'Monday to Friday', value: '7:30 am – 9:00 pm' },
    { label: 'Weekends', value: '9:30 am – 9:00 pm' },
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

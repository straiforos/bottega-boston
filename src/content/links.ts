export const links = {
  order: 'https://ciao724.wixstudio.com/my-site/online-ordering',
  /** Current public site while bottega.boston is still coming online. */
  liveSite: 'https://eatbottega.com',
  instagram: 'https://www.instagram.com/eatbottega/',
  facebook: 'https://www.facebook.com/EATBOTTEGA/',
  email: 'ciao@eatbottega.com',
  phone: '+16172322661',
} as const;

export const orderLocations = [
  {
    id: 'brookline',
    name: 'Bottega Fiorentina',
    area: 'Brookline',
    lines: ['313B Harvard St.', 'Brookline, MA 02446'],
    coordinates: { lat: 42.3434217, lng: -71.12304999999999 },
    orderUrl: 'https://direct.chownow.com/order/18964/locations/27186',
  },
  {
    id: 'boston',
    name: 'Bottega Del Sud',
    area: 'Boston',
    lines: ['645 E 2nd St.', 'Boston, MA 02127'],
    coordinates: { lat: 42.3371986, lng: -71.0372905 },
    orderUrl: 'https://direct.chownow.com/order/18964/locations/63385',
  },
] as const;

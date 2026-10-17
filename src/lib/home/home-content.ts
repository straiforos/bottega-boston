import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { links } from '@/content/links';
import { restaurantContent } from '@/content/en/restaurant';
import hero from '@/assets/hero.asset.json';
import coffee from '@/assets/coffee.asset.json';
import pasta from '@/assets/pasta-club.asset.json';
import mercatino from '@/assets/mercatino.jpg.asset.json';

export const CARD_VARIANTS = ['cream', 'mustard', 'cobalt', 'forest', 'white'] as const;
export const CARD_SHAPES = ['rect', 'arch'] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];
export type CardShape = (typeof CARD_SHAPES)[number];

export interface HeroContent {
  headline: string;
  showStamp: boolean;
  stamp: string;
  imageUrl: string;
  imageAlt: string;
}

export interface OfferingCard {
  shape: CardShape;
  variant: CardVariant;
  titleStyle: 'display' | 'serif';
  title: string;
  badge: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  linkLabel: string;
  linkHref: string;
  stamp: string;
}

export interface HomeContent {
  hero: HeroContent;
  ribbon: string;
  cards: [OfferingCard, OfferingCard, OfferingCard];
}

export const defaultHomeContent: HomeContent = {
  hero: {
    headline: '#PASTAISLIFE',
    showStamp: true,
    stamp: 'Buona\nSemplice\nItalian.',
    imageUrl: hero.url,
    imageAlt: 'A woman in sunglasses enjoying Bottega fettuccine bolognese',
  },
  ribbon: restaurantContent.home.familyIsLife,
  cards: [
    {
      shape: 'rect',
      variant: 'cream',
      titleStyle: 'display',
      title: 'Coffee + house drinks',
      badge: '',
      subtitle: '& dolci',
      imageUrl: coffee.url,
      imageAlt: 'A Bottega guest holding a cappuccino and iced coffee',
      linkLabel: 'Catering menu',
      linkHref: '/menu#category-8',
      stamp: 'Catering\nmenu',
    },
    {
      shape: 'arch',
      variant: 'mustard',
      titleStyle: 'display',
      title: 'The food',
      badge: '',
      subtitle: 'Breakfast, lunch, dinner\n& everything in between.',
      imageUrl: pasta.url,
      imageAlt: 'A woman holding a plate of Bottega pesto pasta',
      linkLabel: 'Food menu',
      linkHref: '/menu',
      stamp: '',
    },
    {
      shape: 'rect',
      variant: 'cobalt',
      titleStyle: 'serif',
      title: 'Il Mercatino',
      badge: 'The little market',
      subtitle: 'A little Bottega.\nTo take home.',
      imageUrl: mercatino.url,
      imageAlt: 'Inside Il Mercatino at Bottega — shelves of pasta, pantry goods and totes',
      linkLabel: 'Explore the market',
      linkHref: `mailto:${links.email}?subject=Il%20Mercatino%20inquiry`,
      stamp: '',
    },
  ],
};

/** Dark card surfaces get cream ink; light ones forest — staff can never pick an illegible pairing. */
export function cardInk(variant: CardVariant) {
  const dark = variant === 'cobalt' || variant === 'forest';
  return { text: dark ? ('cream' as const) : ('forest' as const), link: dark ? ('mustard' as const) : ('forest' as const) };
}

export function isSafeHref(href: string) {
  return /^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/.test(href.trim());
}

export function validateCard(card: OfferingCard): string | null {
  if (!card.title.trim()) return 'Add a title.';
  if (card.title.length > 40) return 'Keep the title under 40 characters.';
  if (!card.imageAlt.trim()) return 'Describe the photo for people using screen readers.';
  if (!card.linkLabel.trim()) return 'Add a link label.';
  if (!isSafeHref(card.linkHref)) return 'Links must start with /, https://, mailto: or tel:.';
  if (!CARD_VARIANTS.includes(card.variant) || !CARD_SHAPES.includes(card.shape)) return 'Pick a style.';
  return null;
}

export function validateHero(hero: HeroContent): string | null {
  if (!hero.headline.trim()) return 'Add a headline.';
  if (hero.headline.length > 24) return 'Keep the headline under 24 characters.';
  if (!hero.imageAlt.trim()) return 'Describe the photo for people using screen readers.';
  if (hero.showStamp && !hero.stamp.trim()) return 'Add stamp text or hide the stamp.';
  return null;
}

export function validateRibbon(text: string): string | null {
  if (!text.trim()) return 'Add ribbon text.';
  if (text.length > 60) return 'Keep the ribbon under 60 characters.';
  return null;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Pure: overlay stored rows on the defaults, ignoring unknown or malformed values. */
export function mergeHomeContent(rows: { key: string; data: Json }[]): HomeContent {
  const byKey = new Map(rows.map((r) => [r.key, r.data as unknown]));
  const pick = <T extends object>(base: T, raw: unknown): T => {
    if (!isObject(raw)) return base;
    const out = { ...base } as Record<string, unknown>;
    for (const [k, v] of Object.entries(base)) if (typeof raw[k] === typeof v) out[k] = raw[k];
    return out as T;
  };
  const ribbon = byKey.get('ribbon');
  const cards = defaultHomeContent.cards.map((card, i) => {
    const merged = pick(card, byKey.get(`card-${i + 1}`));
    return validateCard(merged) ? card : merged;
  }) as HomeContent['cards'];
  return {
    hero: pick(defaultHomeContent.hero, byKey.get('hero')),
    ribbon: isObject(ribbon) && typeof ribbon.text === 'string' && ribbon.text.trim() ? ribbon.text : defaultHomeContent.ribbon,
    cards,
  };
}

export const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);

async function fetchHomeContent() {
  const { data, error } = await supabase.from('home_content').select('key,data');
  if (error) throw error;
  return mergeHomeContent(data);
}

export const homeContentQueryOptions = queryOptions({ queryKey: ['home-content'], queryFn: fetchHomeContent });

export async function saveHomeContent(key: string, data: object) {
  const { error } = await supabase
    .from('home_content')
    .upsert({ key, data: data as Json, updated_at: new Date().toISOString() });
  if (error) throw error;
}

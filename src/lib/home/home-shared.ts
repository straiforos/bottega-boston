import type { Json } from '@/lib/json';
import { links } from '@/content/links';
import { restaurantContent } from '@/content/en/restaurant';
import hero from '@/assets/hero.asset.json';
import coffee from '@/assets/coffee.asset.json';
import pastaFood from '@/assets/the-food.asset.json';
import mercatino from '@/assets/mercatino.jpg.asset.json';
import clubVideo from '@/assets/club-video.asset.json';
import videoPoster from '@/assets/video-poster.asset.json';

export const CARD_VARIANTS = ['cream', 'mustard', 'cobalt', 'forest', 'white'] as const;
export const CARD_SHAPES = ['rect', 'arch'] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];
export type CardShape = (typeof CARD_SHAPES)[number];
export type StoryMediaKind = 'video' | 'image';
/** Ink tones that stay legible on the forest About surface. */
export const STORY_TONES = ['mustard', 'cream', 'forest'] as const;
export type StoryTone = (typeof STORY_TONES)[number];
export const STORY_TITLE_STYLES = ['display', 'serif'] as const;
export type StoryTitleStyle = (typeof STORY_TITLE_STYLES)[number];

export interface HeroContent {
  headline: string;
  showStamp: boolean;
  stamp: string;
  imageUrl: string;
  imageAlt: string;
}

export interface StoryContent {
  mediaKind: StoryMediaKind;
  videoUrl: string;
  posterUrl: string;
  imageUrl: string;
  imageAlt: string;
  /** Pill on the arch; empty hides it. */
  caption: string;
  title: string;
  titleStyle: StoryTitleStyle;
  titleTone: StoryTone;
  subtitle: string;
  subtitleTone: StoryTone;
  /** Body copy; paragraphs separated by blank lines. */
  body: string;
  linkLabel: string;
  linkHref: string;
  linkTone: StoryTone;
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
  story: StoryContent;
  cards: [OfferingCard, OfferingCard, OfferingCard];
}

export const defaultHomeContent: HomeContent = {
  hero: {
    headline: '#PASTAISLIFE',
    showStamp: true,
    stamp: 'Buona\nSemplice\nItalian.',
    imageUrl: hero.url,
    imageAlt: 'A woman in sunglasses eating Bottega pasta at a marble table under the #PASTA IS LIFE neon',
  },
  ribbon: restaurantContent.home.familyIsLife,
  story: {
    mediaKind: 'video',
    videoUrl: clubVideo.url,
    posterUrl: videoPoster.url,
    imageUrl: videoPoster.url,
    imageAlt: 'Bottega Pasta Club — meet, eat, and celebrate life',
    caption: '',
    title: 'Bottega\nPasta Club.',
    titleStyle: 'display',
    titleTone: 'mustard',
    subtitle: 'The place to meet, eat,\nand celebrate life.',
    subtitleTone: 'cream',
    body: 'Judgment-free and full of carbs. A haven where joy is served on a plate alongside a slice of bread.\n\nWith a cannolo in hand and an espresso in the other, we cin cin for a place that feels like home.',
    linkLabel: 'Come join the club',
    linkHref: '#club',
    linkTone: 'mustard',
  },
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
      linkHref: '/menu?section=catering',
      stamp: 'Catering\nmenu',
    },
    {
      shape: 'arch',
      variant: 'mustard',
      titleStyle: 'display',
      title: 'The food',
      badge: '',
      subtitle: 'Breakfast, lunch, dinner\n& everything in between.',
      imageUrl: pastaFood.url,
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
      imageAlt: 'Inside Il Mercatino at Bottega: shelves of pasta, pantry goods and totes',
      linkLabel: 'Explore the market',
      linkHref: `mailto:${links.email}?subject=Il%20Mercatino%20inquiry`,
      stamp: '',
    },
  ],
};

/** Dark card surfaces get cream ink; light ones forest, so staff can never pick an illegible pairing. */
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

export function validateStory(story: StoryContent): string | null {
  if (story.mediaKind !== 'video' && story.mediaKind !== 'image') return 'Pick video or image.';
  if (story.caption.length > 40) return 'Keep the media label under 40 characters.';
  if (!story.title.trim()) return 'Add a title.';
  if (story.title.length > 60) return 'Keep the title under 60 characters.';
  if (!STORY_TITLE_STYLES.includes(story.titleStyle)) return 'Pick a title style.';
  if (!STORY_TONES.includes(story.titleTone) || !STORY_TONES.includes(story.subtitleTone) || !STORY_TONES.includes(story.linkTone)) {
    return 'Pick a story color.';
  }
  if (story.subtitle.length > 120) return 'Keep the subtitle under 120 characters.';
  if (!story.body.trim()) return 'Add body text.';
  if (story.body.length > 600) return 'Keep the body under 600 characters.';
  if (story.linkLabel.trim() && !isSafeHref(story.linkHref)) {
    return 'Links must start with /, #, https://, mailto: or tel:.';
  }
  if (story.mediaKind === 'video') {
    if (!story.videoUrl.trim()) return 'Add a video.';
  } else {
    if (!story.imageUrl.trim()) return 'Add a photo.';
    if (!story.imageAlt.trim()) return 'Describe the photo for people using screen readers.';
  }
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
  const storyMerged = pick(defaultHomeContent.story, byKey.get('story'));
  const story =
    storyMerged.mediaKind === 'video' || storyMerged.mediaKind === 'image'
      ? storyMerged
      : defaultHomeContent.story;
  const cards = defaultHomeContent.cards.map((card, i) => {
    const merged = pick(card, byKey.get(`card-${i + 1}`));
    return validateCard(merged) ? card : merged;
  }) as HomeContent['cards'];
  return {
    hero: pick(defaultHomeContent.hero, byKey.get('hero')),
    ribbon: isObject(ribbon) && typeof ribbon.text === 'string' && ribbon.text.trim() ? ribbon.text : defaultHomeContent.ribbon,
    story: validateStory(story) ? defaultHomeContent.story : story,
    cards,
  };
}

export const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);

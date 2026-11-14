import { defaultHomeContent } from '@/lib/home/home-shared';
import { absoluteUrl } from './absolute-url';

/** Same photo the home hero loads (bundled default; live URL comes from home_content). */
export const DEFAULT_OG_IMAGE = defaultHomeContent.hero.imageUrl;

export type GuestPageMeta = {
  title: string;
  description: string;
  socialDescription: string;
  path: string;
  image?: string;
  robots?: string;
  twitterCard?: 'summary' | 'summary_large_image';
};

export type StaffPageMeta = {
  title: string;
  description: string;
  socialDescription?: string;
};

/** Canonical + Open Graph + Twitter tags for indexable guest pages. */
export function pageHead(meta: GuestPageMeta) {
  const url = absoluteUrl(meta.path);
  const image = absoluteUrl(meta.image ?? DEFAULT_OG_IMAGE);
  const card = meta.twitterCard ?? 'summary_large_image';

  return {
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.socialDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:site_name', content: 'Bottega' },
      { name: 'twitter:card', content: card },
      { name: 'twitter:title', content: meta.title },
      { name: 'twitter:description', content: meta.socialDescription },
      { name: 'twitter:image', content: image },
      ...(meta.robots ? [{ name: 'robots' as const, content: meta.robots }] : []),
    ],
    links: [{ rel: 'canonical' as const, href: url }],
  };
}

/** Staff / non-indexable pages — always noindex, nofollow. */
export function staffPageHead(meta: StaffPageMeta) {
  const social = meta.socialDescription ?? meta.description;
  return {
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: social },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  };
}

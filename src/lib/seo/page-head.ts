import { absoluteUrl } from './absolute-url';

export type GuestPageMeta = {
  title: string;
  description: string;
  socialDescription: string;
  path: string;
  /** From SSR `home_content` (or another loader). Omit when unknown — no hardcoded hero fallback. */
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
  const image = meta.image?.trim() ? absoluteUrl(meta.image.trim()) : null;
  const card = meta.twitterCard ?? (image ? 'summary_large_image' : 'summary');

  return {
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.socialDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: 'Bottega' },
      { name: 'twitter:card', content: card },
      { name: 'twitter:title', content: meta.title },
      { name: 'twitter:description', content: meta.socialDescription },
      ...(image
        ? [
            { property: 'og:image' as const, content: image },
            { name: 'twitter:image' as const, content: image },
          ]
        : []),
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

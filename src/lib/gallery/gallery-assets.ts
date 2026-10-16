/** Bundled gallery media: seeded tiles point here by key, and it doubles as the first-paint fallback. */
import socialVideo from '@/assets/social-video.asset.json';
import socialVideo480 from '@/assets/social-video-v480.asset.json';
import socialVideo720 from '@/assets/social-video-v720.asset.json';
import socialVideoPoster from '@/assets/social-video-poster.asset.json';
import social1 from '@/assets/social-1.asset.json';
import social2 from '@/assets/social-2.asset.json';
import social3 from '@/assets/social-3.asset.json';
import type { GalleryItem, MediaVersion } from './types';

interface BundledMedia {
  readonly url: string;
  readonly poster?: string;
  readonly versions: readonly MediaVersion[];
}

export const galleryAssets: Record<string, BundledMedia> = {
  'social-video': {
    url: socialVideo720.url,
    poster: socialVideoPoster.url,
    versions: [
      { key: 'small', url: socialVideo480.url, width: 480 },
      { key: 'standard', url: socialVideo720.url, width: 720 },
      { key: 'hq', url: socialVideo.url, width: 720 },
    ],
  },
  'social-1': { url: social1.url, versions: [] },
  'social-2': { url: social2.url, versions: [] },
  'social-3': { url: social3.url, versions: [] },
};

const tile = (id: string, type: GalleryItem['type'], key: string, alt: string, caption: string, sortOrder: number) => ({
  id,
  type,
  ...galleryAssets[key],
  alt,
  caption,
  sortOrder,
});

export const fallbackGallery: GalleryItem[] = [
  tile('tile-video', 'video', 'social-video', 'A moment at Bottega', '', 0),
  tile('tile-1', 'image', 'social-1', 'Enjoying a sweet treat at Bottega', 'La dolce vita', 1),
  tile('tile-2', 'image', 'social-2', 'A Bottega guest sharing a plate of pasta', '#pastaislife', 2),
  tile('tile-3', 'image', 'social-3', 'Coffee and a little work at Bottega', 'Caffè, always', 3),
];

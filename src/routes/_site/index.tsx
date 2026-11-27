import { createFileRoute } from '@tanstack/react-router';
import { restaurantContent } from '@/content/en/restaurant';
import { HomePage } from '@/features/home/HomePage';
import { pageHead } from '@/lib/seo/page-head';
import type { SiteHomeLoaderData } from '../_site';

export type HomeLoaderData = SiteHomeLoaderData;

export const Route = createFileRoute('/_site/')({
  head: ({ matches }) => {
    const site = matches.find((m) => m.routeId === '/_site');
    const home = (site?.loaderData as SiteHomeLoaderData | undefined)?.home;
    const heroImageUrl = home?.hero.imageUrl?.trim();
    const head = pageHead({
      ...restaurantContent.metadata.home,
      path: '/',
      ...(heroImageUrl ? { image: heroImageUrl } : {}),
    });
    return {
      ...head,
      links: [
        ...head.links,
        ...(heroImageUrl
          ? [{ rel: 'preload' as const, as: 'image' as const, href: heroImageUrl }]
          : []),
      ],
    };
  },
  component: HomePage,
});

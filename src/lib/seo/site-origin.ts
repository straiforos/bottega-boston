/** Production apex for absolute meta/sitemap/JSON-LD URLs (in-app hrefs stay relative). */
export const PUBLIC_SITE_ORIGIN = 'https://bottega.boston';

/** Prefer Worker SITE_ORIGIN when present; otherwise the production apex. */
export function resolveSiteOrigin(siteOrigin: string | undefined): string {
  const configured = siteOrigin?.replace(/\/+$/, '');
  return configured || PUBLIC_SITE_ORIGIN;
}

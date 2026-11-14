import { absoluteUrl } from './absolute-url';

/** Contract version for mockupPreviewPlugin (`staticData: { sitemap: false }` on previews). */
export const sitemapRouteInventoryVersion = 1;

/** Guest pages Google may index — never admin, emails, API, media, or previews. */
export const INDEXABLE_PATHS = ['/', '/menu', '/order', '/catering', '/events/request'] as const;

export type IndexablePath = (typeof INDEXABLE_PATHS)[number];

export function buildSitemapXml(origin: string): string {
  const urls = INDEXABLE_PATHS.map(
    (path) => `  <url>\n    <loc>${escapeXml(absoluteUrl(path, origin))}</loc>\n  </url>`,
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

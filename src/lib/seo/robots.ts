/** Path prefixes crawlers must not fetch (staff, APIs, canvas previews). */
export const ROBOTS_DISALLOW = ['/admin', '/emails', '/api', '/__mockup', '/__component'] as const;

export function buildRobotsTxt(origin: string): string {
  const base = origin.replace(/\/+$/, '');
  const disallows = ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`).join('\n');
  return `User-agent: *\nAllow: /\n${disallows}\n\nSitemap: ${base}/sitemap.xml\n`;
}

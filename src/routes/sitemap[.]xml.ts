import { createFileRoute } from '@tanstack/react-router';
import { buildSitemapXml } from '@/lib/seo/sitemap';
import { resolveSiteOrigin } from '@/lib/seo/site-origin';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const { env } = await import('cloudflare:workers');
        const xml = buildSitemapXml(resolveSiteOrigin(env.SITE_ORIGIN));
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});

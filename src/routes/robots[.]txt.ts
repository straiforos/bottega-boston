import { createFileRoute } from '@tanstack/react-router';
import { buildRobotsTxt } from '@/lib/seo/robots';
import { resolveSiteOrigin } from '@/lib/seo/site-origin';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { env } = await import('cloudflare:workers');
        const body = buildRobotsTxt(resolveSiteOrigin(env.SITE_ORIGIN));
        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});

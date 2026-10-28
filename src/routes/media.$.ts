import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';

/** Serves bundled and uploaded media from the R2 MEDIA binding when no public base URL is set. */
export const Route = createFileRoute('/media/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat ?? '';
        if (!key || key.includes('..')) return new Response('Not found', { status: 404 });
        const object = await env.MEDIA.get(key);
        if (!object) return new Response('Not found', { status: 404 });
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        return new Response(object.body, { headers });
      },
    },
  },
});

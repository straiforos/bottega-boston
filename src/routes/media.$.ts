import { createFileRoute } from '@tanstack/react-router';

/** Serves bundled and uploaded media from the R2 MEDIA binding when no public base URL is set. */
export const Route = createFileRoute('/media/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat ?? '';
        if (!key || key.includes('..')) return new Response('Not found', { status: 404 });
        // Dynamic import so plain `vite dev` can load the route tree without the
        // Cloudflare plugin; the Vite local-media middleware serves /media there.
        const { env } = await import('cloudflare:workers');
        const object = await env.MEDIA.get(key);
        if (!object) return new Response('Not found', { status: 404 });
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        // Bundled keys are occasionally overwritten in place (e.g. pasta-club.png),
        // so avoid year-long immutable caching that traps browsers on stale bytes.
        headers.set('Cache-Control', 'public, max-age=86400, must-revalidate');
        return new Response(object.body, { headers });
      },
    },
  },
});

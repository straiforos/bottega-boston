/**
 * During plain `vite dev` (no Cloudflare plugin), serve /media/* from
 * export/local-media so guest pages get seeded hero/gallery/event assets.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const mediaRoot = path.join(root, 'export/local-media');

function contentType(file) {
  if (file.endsWith('.webp')) return 'image/webp';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

export function localMediaPlugin() {
  return {
    name: 'bottega-local-media',
    // Register early (before TanStack Start) so /media never hits the Worker route.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/media/')) return next();

        const raw = decodeURIComponent(url.slice('/media/'.length).split('?')[0] ?? '');
        if (!raw || raw.includes('..') || path.isAbsolute(raw)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Not found');
          return;
        }

        const file = path.resolve(mediaRoot, raw);
        if (!file.startsWith(mediaRoot + path.sep) && file !== mediaRoot) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Not found');
          return;
        }

        if (!existsSync(file) || !statSync(file).isFile()) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Not found');
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType(file));
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        createReadStream(file).pipe(res);
      });
    },
  };
}

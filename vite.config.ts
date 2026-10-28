import path from 'path';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { mockupPreviewPlugin } from './mockupPreviewPlugin';

export default defineConfig(({ command, isPreview }) => {
  // Build emits the Worker; preview (including TanStack prerender) needs the
  // same plugin so Miniflare serves HTML. Plain `vite dev` stays without it.
  const useCloudflare = command === 'build' || !!isPreview;

  return {
    server: {
      host: '::',
      port: 8080,
    },
    // ffmpeg.wasm spawns its own worker; pre-bundling breaks its worker URL.
    optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
    worker: { format: 'es' },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      // Writes src/.generated/mockup-components.ts before routes resolve it.
      mockupPreviewPlugin(),
      tsConfigPaths({ projects: ['./tsconfig.json'] }),
      ...(useCloudflare ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
      tanstackStart({
        // Static HTML shells for guest pages (served as assets; Worker still SSR
        // staff/API). Filter keeps admin, email studio, and API out of the crawl.
        prerender: {
          enabled: true,
          crawlLinks: true,
          failOnError: true,
          filter: ({ path }) =>
            !path.includes('#') &&
            !path.startsWith('/admin') &&
            !path.startsWith('/emails') &&
            !path.startsWith('/api') &&
            !path.startsWith('/media') &&
            !path.includes('__mockup') &&
            !path.includes('__component'),
        },
        pages: [
          { path: '/' },
          { path: '/menu' },
          { path: '/catering' },
          { path: '/events/request' },
          { path: '/unsubscribed' },
        ],
      }),
      viteReact(),
    ],
  };
});

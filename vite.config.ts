import path from 'path';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { mockupPreviewPlugin } from './mockupPreviewPlugin';

export default defineConfig(({ command }) => {
  // Cloudflare Workers plugin only on build (produces the worker output);
  // the workerd runtime isn't available for the plain Vite dev server.
  const useCloudflare = command === 'build';

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
        // Static prerender is off until TanStack Start can load the Cloudflare
        // Vite SSR entry (cloudflare: scheme / server.js vs index.js). Pages
        // still SSR on the Worker at request time.
        prerender: {
          enabled: false,
        },
      }),
      viteReact(),
    ],
  };
});

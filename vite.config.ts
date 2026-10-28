import path from 'path';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';

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
      tsConfigPaths({ projects: ['./tsconfig.json'] }),
      ...(useCloudflare ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
      tanstackStart({
        pages: [
          { path: '/' },
          { path: '/menu' },
          { path: '/catering' },
          { path: '/events/request' },
          { path: '/unsubscribed' },
        ],
        prerender: {
          enabled: true,
          crawlLinks: false,
          failOnError: true,
        },
      }),
      viteReact(),
    ],
  };
});

import path from 'path';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { componentTagger } from 'lovable-tagger';
import { mockupPreviewPlugin } from './mockupPreviewPlugin';

export default defineConfig(({ command, mode }) => {
  // Cloudflare Workers plugin only on build (produces the worker output);
  // the workerd runtime isn't available for the dev server.
  const useCloudflare = command === 'build';

  return {
    server: {
      host: '::',
      port: 8080,
      // Local dev only: serve CDN-managed media through the preview host.
      // Ignored in production builds, where the platform serves /__l5e itself.
      proxy: {
        '/__l5e/assets-v1': {
          target: 'https://id-preview--122eb82d-0dcb-4681-bbd6-9e6446b687c2.lovable.app',
          changeOrigin: true,
        },
      },
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
      mockupPreviewPlugin({ designSystemPolling: true }),
      tsConfigPaths({ projects: ['./tsconfig.json'] }),
      ...(useCloudflare ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
      tanstackStart(),
      viteReact(),
      ...(mode === 'development' ? [componentTagger()] : []),
    ],
  };
});

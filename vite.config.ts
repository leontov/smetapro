import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import path from 'node:path';

const pwaPlugin = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'pwa-icon.svg', 'offline.html'],
  manifest: {
    name: 'SmetaPro',
    short_name: 'SmetaPro',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#22d3ee',
    description: 'Project estimation companion',
    icons: [
      {
        src: 'pwa-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      },
      {
        src: 'pwa-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    navigateFallback: '/offline.html',
    navigateFallbackAllowlist: [/^\/[^_]/],
    additionalManifestEntries: [{ url: '/offline.html', revision: '1' }],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30
          }
        }
      },
      {
        urlPattern: ({ request }) => request.destination === 'image',
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30
          }
        }
      }
    ]
  },
  devOptions: {
    enabled: true
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwaPlugin],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          state: ['zustand', '@tanstack/react-query']
        }
      }
    }
  }
});

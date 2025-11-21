import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            { displayName: false, minify: true, transpileTemplateLiterals: true },
          ],
        ],
      },
    }),
    VitePWA({
      devOptions: { enabled: true, type: 'module' },
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\//,
            handler: 'StaleWhileRevalidate',
            method: 'GET',
            options: { cacheName: 'api-cache' },
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
              backgroundSync: {
                name: 'post-queue',
                options: { maxRetentionTime: 24 * 60 },
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: false,
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.cali-yoo.online',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

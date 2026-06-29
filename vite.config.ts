import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path";

export default defineConfig({
  base: '/tools/timetableApps/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: '時間割アプリ',
        short_name: '時間割',
        description: '時間割アプリ',
        start_url: '/tools/timetableApps/',
        scope: '/',
        theme_color: "#192F60",
        background_color: '#ffffff',
        display: 'standalone',
        id: 'timetableApps.tools.io.github.1bunkaiyu314',

        "icons": [
            {
            "src": "images/icon-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
            },
            {
            "src": "images/icon-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
            }
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
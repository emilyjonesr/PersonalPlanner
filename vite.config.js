import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/PersonalPlanner/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Daily Planner',
        short_name: 'Planner',
        description: 'Personal daily planner',
        theme_color: '#e91e8c',
        background_color: '#f5f5f5',
        display: 'standalone',
        start_url: '/PersonalPlanner/',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
});

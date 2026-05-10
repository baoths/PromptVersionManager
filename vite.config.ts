import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/PromptVersionManager/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Prompt Version Manager',
        short_name: 'PVM',
        start_url: '.',
        display: 'standalone',
        background_color: '#0f1114',
        theme_color: '#1f7a6b',
      },
    }),
  ],
})

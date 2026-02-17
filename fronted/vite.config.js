// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),           // official Tailwind → Vite integration (fastest in 2025/2026)
  ],

  server: {
    proxy: {
      // All requests to /api/... go to your backend (no CORS issues in dev)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
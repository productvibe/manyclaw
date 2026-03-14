import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  // Renderer source lives in src/renderer/
  root: 'src/renderer',

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },

  build: {
    // Output relative to project root, not Vite's root
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },

  // In dev mode, electron's main process reads this URL from VITE_DEV_SERVER_URL
  server: {
    port: 5173,
    strictPort: true,
  },

  // Electron renderer runs in a Node-less Chromium context
  // Don't polyfill Node built-ins
  optimizeDeps: {
    exclude: [],
  },
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser';
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/lucide-react') ||
            id.includes('node_modules/canvas-confetti')
          ) {
            return 'react-vendor';
          }
          if (id.includes('src/levels/levelsData')) return 'levels-data';
        },
      },
    },
  },
});

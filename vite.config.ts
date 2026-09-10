import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    allowedHosts: [
      'civilian-wallet-flying-poster.trycloudflare.com',
      '.trycloudflare.com',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5174,
    host: true,
    allowedHosts: [
      'civilian-wallet-flying-poster.trycloudflare.com',
      '.trycloudflare.com',
    ],
  }
});

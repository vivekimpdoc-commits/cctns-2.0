import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({command}) => ({
  plugins: [react()],
  // Base path for GitHub Pages: https://vivekimpdoc-commits.github.io/cctns-2.0/
  base: command === 'build' ? '/cctns-2.0/' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
}));

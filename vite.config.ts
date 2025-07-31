import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',
  root: path.resolve(__dirname, 'src/renderer'),
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    assetsDir: '.',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, './src/renderer/index.html')
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@main': path.resolve(__dirname, './src/main'),
      '@preload': path.resolve(__dirname, './src/preload'),
      '@assets': path.resolve(__dirname, './src/renderer/assets'),
      'pdfjs-dist': path.resolve(__dirname, './node_modules/pdfjs-dist')
    }
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: './tsconfig.json'
    }
  }
});
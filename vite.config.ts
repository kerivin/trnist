import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  base: './',
  root: path.resolve(__dirname, 'src/renderer'),
  plugins: [react(),
    viteStaticCopy({
      targets: [
        {
          src: path.join(__dirname, 'node_modules/pdfjs-dist/cmaps/*'),
          dest: 'cmaps'
        },
        {
          src: path.join(__dirname, 'node_modules/pdfjs-dist/wasm/*.wasm'),
          dest: 'wasm'
        }
      ]
    })
  ],
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
    include: ['pdfjs-dist'],
    esbuildOptions: {
      tsconfig: './tsconfig.json',
      target: 'esnext',
      supported: {
        'top-level-await': true
      },
    }
  }
});
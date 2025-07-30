import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    rollupOptions: {
      external: ['electron', ...builtinModules],
    },
    target: 'node20',
    outDir: 'dist/main',
    emptyOutDir: false,
  },
});
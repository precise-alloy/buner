import { defineConfig } from 'vite';

const entryFileNames = () => {
  return '[name].js';
};

const bannerFileNames = (chunk: { name: string }) => {
  return chunk.name === 'buner' ? '#!/usr/bin/env node' : '';
};

export default defineConfig({
  base: '/',
  publicDir: false,
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    sourcemap: false,
    ssr: true,
    rollupOptions: {
      input: ['cli/buner.ts', 'server.ts', 'prerender.ts', 'integration.ts', 'styles.ts', 'scripts.ts', 'states.ts', 'migrate-scss.ts'],
      output: {
        entryFileNames,
        banner: bannerFileNames,
      },
    },
  },
});

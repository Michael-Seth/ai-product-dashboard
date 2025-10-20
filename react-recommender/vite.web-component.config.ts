
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/react-recommender-web-component',
  plugins: [react(), nxViteTsPaths()],
  build: {
    outDir: '../dist/react-recommender-web-component',
    emptyOutDir: true,
    reportCompressedSize: true,
    minify: 'terser',
    sourcemap: false,
    target: 'es2020',
    lib: {
      entry: 'src/web-component-main.tsx',
      name: 'ReactRecommender',
      fileName: 'react-recommender',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096
  },
}));

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/react-recommender-web-component',
  plugins: [react(), nxViteTsPaths()],
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'globalThis',
  },
  build: {
    outDir: '../dist/react-recommender-web-component',
    emptyOutDir: true,
    reportCompressedSize: true,
    minify: false, // Disable minification for debugging
    sourcemap: true, // Enable source maps for debugging
    target: 'es2020',
    lib: {
      entry: './src/web-component-main.tsx',
      name: 'ReactRecommender',
      fileName: 'react-recommender',
      formats: ['iife']
    },
    rollupOptions: {
      treeshake: false, // Disable tree shaking to preserve side effects
      external: [],
      output: {
        globals: {},
        entryFileNames: 'react-recommender.js',
        assetFileNames: 'react-recommender.[ext]'
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096
  },
}));
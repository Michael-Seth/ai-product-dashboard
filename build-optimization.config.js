/**
 * Build Optimization Configuration
 * 
 * This file contains shared build optimization settings
 * for both Angular and React applications.
 */

const buildOptimization = {
  common: {
    minify: true,
    sourcemap: false,
    target: 'es2020',
    treeshake: true,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },
  angular: {
    optimization: {
      scripts: true,
      styles: {
        minify: true,
        inlineCritical: true
      },
      fonts: true
    },
    buildOptimizer: true,
    aot: true,
    vendorChunk: true,
    commonChunk: true,
    namedChunks: false,
    extractLicenses: true,
    outputHashing: 'all'
  },
  react: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  webComponent: {
    minify: 'terser',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    }
  }
};

module.exports = buildOptimization;
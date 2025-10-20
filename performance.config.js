/**
 * Performance Configuration
 * 
 * Configuration for performance monitoring and optimization
 * settings across the application.
 */

const performanceConfig = {
  // Bundle size limits (in bytes)
  bundleLimits: {
    angular: {
      initial: 1024 * 1024, // 1MB
      anyComponentStyle: 8 * 1024, // 8KB
      warning: 500 * 1024, // 500KB
    },
    react: {
      chunk: 1000 * 1024, // 1MB
      asset: 4 * 1024, // 4KB inline limit
      warning: 500 * 1024, // 500KB
    },
    webComponent: {
      total: 500 * 1024, // 500KB
      warning: 300 * 1024, // 300KB
    }
  },

  // Performance budgets
  performanceBudgets: {
    // Core Web Vitals targets
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1,  // Cumulative Layout Shift
    
    // Additional metrics
    fcp: 1800, // First Contentful Paint (ms)
    ttfb: 600, // Time to First Byte (ms)
    
    // Resource loading
    jsExecutionTime: 50, // Main thread blocking time (ms)
    totalBlockingTime: 200, // Total blocking time (ms)
  },

  // Optimization strategies
  optimizations: {
    // Code splitting
    codeSplitting: {
      enabled: true,
      chunkStrategy: 'vendor-separation',
      dynamicImports: true
    },
    
    // Tree shaking
    treeShaking: {
      enabled: true,
      sideEffects: false,
      unusedExports: true
    },
    
    // Minification
    minification: {
      js: 'terser',
      css: true,
      html: true,
      removeComments: true,
      removeWhitespace: true
    },
    
    // Asset optimization
    assets: {
      inlineLimit: 4096, // 4KB
      imageOptimization: true,
      fontOptimization: true,
      svgOptimization: true
    },
    
    // Caching
    caching: {
      staticAssets: '1y', // 1 year
      apiResponses: '5m', // 5 minutes
      htmlPages: '1h', // 1 hour
    }
  },

  // Monitoring
  monitoring: {
    // Performance API
    performanceObserver: true,
    
    // Bundle analysis
    bundleAnalysis: {
      enabled: true,
      threshold: 100 * 1024, // Report files > 100KB
      reportPath: './performance-report.json'
    },
    
    // Runtime monitoring
    runtime: {
      memoryUsage: true,
      renderTime: true,
      apiLatency: true
    }
  },

  // Development vs Production
  environments: {
    development: {
      sourceMaps: true,
      minification: false,
      bundleAnalysis: false,
      monitoring: false
    },
    production: {
      sourceMaps: false,
      minification: true,
      bundleAnalysis: true,
      monitoring: true
    }
  }
};

module.exports = performanceConfig;
/**
 * Configuration for console.log removal script
 */

module.exports = {
  // File extensions to process
  extensions: ['.ts', '.js', '.tsx', '.jsx'],
  
  // Directories to exclude from processing
  excludeDirs: [
    'node_modules',
    'dist',
    'coverage',
    '.git',
    '.nx',
    '.angular',
    'tmp',
    'build',
    '.vscode',
    '.idea'
  ],
  
  // Files to exclude from processing
  excludeFiles: [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'angular.json',
    'nx.json',
    '.gitignore',
    'README.md',
    'CHANGELOG.md',
    'LICENSE'
  ],
  
  // Console methods to target
  consoleMethods: {
    // Always remove these (debug/development logging)
    remove: [
      'log',
      'debug',
      'info',
      'trace',
      'table',
      'group',
      'groupEnd',
      'time',
      'timeEnd',
      'count',
      'countReset',
      'dir',
      'dirxml'
    ],
    
    // Preserve these by default (important for production)
    preserve: [
      'error',
      'warn'
    ],
    
    // Remove only in production builds
    conditionalRemove: [
      'assert'
    ]
  },
  
  // Patterns to preserve (regex patterns)
  preservePatterns: [
    // Console statements in comments
    /\/\/.*console\./g,
    /\/\*[\s\S]*?console\.[\s\S]*?\*\//g,
    
    // Console statements in string literals
    /['"`].*console\..*['"`]/g,
    
    // Important error handling patterns
    /console\.(error|warn)\s*\(\s*['"`].*error.*['"`]/gi,
    /console\.(error|warn)\s*\(\s*['"`].*failed.*['"`]/gi,
    /console\.(error|warn)\s*\(\s*['"`].*exception.*['"`]/gi,
  ],
  
  // File-specific rules
  fileRules: {
    // Test files - might want to preserve more console statements
    test: {
      pattern: /\.(test|spec)\.(ts|js)$/,
      preserveAll: false,
      preserveDebug: true
    },
    
    // Configuration files
    config: {
      pattern: /\.(config|conf)\.(ts|js)$/,
      preserveAll: false,
      preserveDebug: true
    },
    
    // Development server files
    devServer: {
      pattern: /(dev-server|server)\.(ts|js)$/,
      preserveAll: false,
      preserveInfo: true
    },
    
    // Build scripts
    buildScript: {
      pattern: /(build|deploy|script)\.(ts|js)$/,
      preserveAll: false,
      preserveInfo: true
    }
  },
  
  // Environment-specific rules
  environments: {
    development: {
      preserveDebug: true,
      preserveInfo: true
    },
    
    production: {
      removeAll: true,
      preserveErrors: true
    },
    
    test: {
      preserveDebug: true,
      preserveAll: false
    }
  },
  
  // Replacement options
  replacement: {
    // Replace with empty string or comment
    replaceWith: '', // '' | '// console.log removed' | '/* removed */'
    
    // Keep indentation when removing
    preserveIndentation: true,
    
    // Remove empty lines after removal
    cleanupEmptyLines: true,
    
    // Maximum consecutive empty lines to keep
    maxEmptyLines: 2
  },
  
  // Output options
  output: {
    showProgress: true,
    showStats: true,
    showFileDetails: false,
    logLevel: 'info', // 'silent', 'error', 'warn', 'info', 'verbose'
    createBackups: false
  },
  
  // Advanced options
  advanced: {
    // Handle console statements in template literals
    handleTemplateLiterals: true,
    
    // Handle console statements in object methods
    handleObjectMethods: true,
    
    // Handle console statements in arrow functions
    handleArrowFunctions: true,
    
    // Handle chained console statements
    handleChainedCalls: true,
    
    // Handle console statements with complex expressions
    handleComplexExpressions: true
  }
};
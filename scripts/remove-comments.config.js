/**
 * Configuration for comment removal script
 */

module.exports = {
  // File extensions to process
  extensions: ['.ts', '.js', '.html', '.css', '.scss', '.jsx', '.tsx'],
  
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
    'LICENSE',
    'CONTRIBUTING.md'
  ],
  
  // Patterns to preserve (regex patterns)
  preservePatterns: {
    // JavaScript/TypeScript patterns
    js: [
      /\/\*\*[\s\S]*?\*\//g,  // JSDoc comments
      /\/\*[\s\S]*?license[\s\S]*?\*\//gi,  // License headers
      /\/\*[\s\S]*?copyright[\s\S]*?\*\//gi,  // Copyright notices
      /\/\*[\s\S]*?author[\s\S]*?\*\//gi,  // Author information
      /\/\/\s*@[\w-]+/g,  // Decorator comments (@Component, @Injectable, etc.)
      /\/\/\s*eslint/g,  // ESLint directives
      /\/\/\s*prettier/g,  // Prettier directives
      /\/\/\s*webpack/g,  // Webpack comments
      /\/\/\s*vite/g,  // Vite comments
      /\/\/\s*TODO:/g,  // TODO comments (optional)
      /\/\/\s*FIXME:/g,  // FIXME comments (optional)
      /\/\/\s*NOTE:/g,  // NOTE comments (optional)
    ],
    
    // HTML patterns
    html: [
      /<!--[\s\S]*?ng-[\s\S]*?-->/g,  // Angular comments
      /<!--[\s\S]*?angular[\s\S]*?-->/gi,  // Angular-related comments
      /<!--\[if[\s\S]*?-->/g,  // Conditional comments
      /<!DOCTYPE[\s\S]*?>/g,  // DOCTYPE declarations
    ],
    
    // CSS/SCSS patterns
    css: [
      /\/\*[\s\S]*?license[\s\S]*?\*\//gi,  // License headers
      /\/\*[\s\S]*?copyright[\s\S]*?\*\//gi,  // Copyright notices
      /\/\*[\s\S]*?@[\w-]+[\s\S]*?\*\//g,  // CSS at-rules in comments
    ]
  },
  
  // Custom rules for specific file types
  customRules: {
    // TypeScript specific rules
    '.ts': {
      preserveJSDoc: true,
      preserveDecorators: true,
      preserveTodos: false
    },
    
    // JavaScript specific rules
    '.js': {
      preserveJSDoc: true,
      preserveTodos: false
    },
    
    // HTML specific rules
    '.html': {
      preserveAngularComments: true,
      preserveConditionalComments: true
    },
    
    // CSS/SCSS specific rules
    '.css': {
      preserveLicenseHeaders: true
    },
    
    '.scss': {
      preserveLicenseHeaders: true
    }
  },
  
  // Specific file patterns to handle differently
  filePatterns: {
    // Test files - might want to preserve more comments
    test: {
      pattern: /\.(test|spec)\.(ts|js)$/,
      preserveDescriptiveComments: true
    },
    
    // Configuration files
    config: {
      pattern: /\.(config|conf)\.(ts|js)$/,
      preserveDescriptiveComments: true
    },
    
    // Component files
    component: {
      pattern: /\.component\.(ts|html|scss)$/,
      preserveJSDoc: true
    }
  },
  
  // Output options
  output: {
    showProgress: true,
    showStats: true,
    logLevel: 'info' // 'silent', 'error', 'warn', 'info', 'verbose'
  }
};
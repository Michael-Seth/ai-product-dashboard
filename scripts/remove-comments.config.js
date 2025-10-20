/**
 * Configuration for comment removal script
 */

module.exports = {
  extensions: ['.ts', '.js', '.html', '.css', '.scss', '.jsx', '.tsx'],
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
  preservePatterns: {
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
    html: [
      /<!--[\s\S]*?ng-[\s\S]*?-->/g,  // Angular comments
      /<!--[\s\S]*?angular[\s\S]*?-->/gi,  // Angular-related comments
      /<!--\[if[\s\S]*?-->/g,  // Conditional comments
      /<!DOCTYPE[\s\S]*?>/g,  // DOCTYPE declarations
    ],
    css: [
      /\/\*[\s\S]*?license[\s\S]*?\*\//gi,  // License headers
      /\/\*[\s\S]*?copyright[\s\S]*?\*\//gi,  // Copyright notices
      /\/\*[\s\S]*?@[\w-]+[\s\S]*?\*\//g,  // CSS at-rules in comments
    ]
  },
  customRules: {
    '.ts': {
      preserveJSDoc: true,
      preserveDecorators: true,
      preserveTodos: false
    },
    '.js': {
      preserveJSDoc: true,
      preserveTodos: false
    },
    '.html': {
      preserveAngularComments: true,
      preserveConditionalComments: true
    },
    '.css': {
      preserveLicenseHeaders: true
    },
    
    '.scss': {
      preserveLicenseHeaders: true
    }
  },
  filePatterns: {
    test: {
      pattern: /\.(test|spec)\.(ts|js)$/,
      preserveDescriptiveComments: true
    },
    config: {
      pattern: /\.(config|conf)\.(ts|js)$/,
      preserveDescriptiveComments: true
    },
    component: {
      pattern: /\.component\.(ts|html|scss)$/,
      preserveJSDoc: true
    }
  },
  output: {
    showProgress: true,
    showStats: true,
    logLevel: 'info' // 'silent', 'error', 'warn', 'info', 'verbose'
  }
};
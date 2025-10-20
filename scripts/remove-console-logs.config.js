/**
 * Configuration for console.log removal script
 */

module.exports = {

  extensions: ['.ts', '.js', '.tsx', '.jsx'],

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
    'scripts',
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
    'LICENSE'
  ],

  consoleMethods: {

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

    preserve: [
      'error',
      'warn'
    ],

    conditionalRemove: [
      'assert'
    ]
  },

  preservePatterns: [

    /\/\/.*console\./g,
    /\/\*[\s\S]*?console\.[\s\S]*?\*\//g,

    /['"`].*console\..*['"`]/g,

    /console\.(error|warn)\s*\(\s*['"`].*error.*['"`]/gi,
    /console\.(error|warn)\s*\(\s*['"`].*failed.*['"`]/gi,
    /console\.(error|warn)\s*\(\s*['"`].*exception.*['"`]/gi,
  ],

  fileRules: {

    test: {
      pattern: /\.(test|spec)\.(ts|js)$/,
      preserveAll: false,
      preserveDebug: true
    },

    config: {
      pattern: /\.(config|conf)\.(ts|js)$/,
      preserveAll: false,
      preserveDebug: true
    },

    devServer: {
      pattern: /(dev-server|server)\.(ts|js)$/,
      preserveAll: false,
      preserveInfo: true
    },

    buildScript: {
      pattern: /(build|deploy|script)\.(ts|js)$/,
      preserveAll: false,
      preserveInfo: true
    }
  },

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

  replacement: {

    replaceWith: '', // '' | '// console.log removed' | ''

    preserveIndentation: true,

    cleanupEmptyLines: true,

    maxEmptyLines: 2
  },

  output: {
    showProgress: true,
    showStats: true,
    showFileDetails: false,
    logLevel: 'info', // 'silent', 'error', 'warn', 'info', 'verbose'
    createBackups: false
  },

  advanced: {

    handleTemplateLiterals: true,

    handleObjectMethods: true,

    handleArrowFunctions: true,

    handleChainedCalls: true,

    handleComplexExpressions: true
  }
};
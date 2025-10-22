#!/usr/bin/env node

/**
 * Comment Removal Script for AI E-commerce Platform
 * 
 * This script removes comments from TypeScript, JavaScript, HTML, CSS, and SCSS files
 * while preserving important documentation like license headers and JSDoc comments.
 * 
 * Usage:
 *   node scripts/remove-comments.js [options]
 * 
 * Options:
 *   --dry-run    Show what would be changed without modifying files
 *   --preserve   Preserve JSDoc comments (/** ... 
 *   --verbose    Show detailed output
 *   --help       Show this help message
 */

const fs = require('fs');
const path = require('path');

class CommentRemover {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      preserveJSDoc: options.preserve || true,
      verbose: options.verbose || false,
      ...options
    };
    
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      commentsRemoved: 0,
      linesRemoved: 0
    };

    this.extensions = ['.ts', '.js', '.html', '.css', '.scss', '.jsx', '.tsx'];

    this.excludeDirs = [
      'node_modules',
      'dist',
      'coverage',
      '.git',
      '.nx',
      '.angular',
      'tmp',
      'build'
    ];

    this.excludeFiles = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'angular.json',
      'nx.json',
      '.gitignore',
      'README.md',
      'CHANGELOG.md'
    ];
  }

  /**
   * Main entry point - removes comments from the entire codebase
   */
  async removeCommentsFromCodebase(rootDir = '.') {

    
    try {
      await this.processDirectory(rootDir);
      this.printSummary();
    } catch (error) {
      console.error('❌ Error during comment removal:', error.message);
      process.exit(1);
    }
  }


  async processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {

        if (this.excludeDirs.includes(entry.name)) {

          continue;
        }
        
        await this.processDirectory(fullPath);
      } else if (entry.isFile()) {
        await this.processFile(fullPath);
      }
    }
  }

  /**
   * Process individual file
   */
  async processFile(filePath) {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);

    if (this.excludeFiles.includes(fileName)) {
      return;
    }

    if (!this.extensions.includes(fileExt)) {
      return;
    }
    
    this.stats.filesProcessed++;
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const processedContent = this.removeCommentsFromContent(originalContent, fileExt);
      
      if (originalContent !== processedContent) {
        this.stats.filesModified++;
        
        
        if (!this.options.dryRun) {
          fs.writeFileSync(filePath, processedContent, 'utf8');
        }

        const originalLines = originalContent.split('\n').length;
        const processedLines = processedContent.split('\n').length;
        this.stats.linesRemoved += (originalLines - processedLines);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  removeCommentsFromContent(content, fileExt) {
    switch (fileExt) {
      case '.ts':
      case '.js':
      case '.tsx':
      case '.jsx':
        return this.removeJSComments(content);
      case '.html':
        return this.removeHTMLComments(content);
      case '.css':
      case '.scss':
        return this.removeCSSComments(content);
      default:
        return content;
    }
  }


  removeJSComments(content) {
    let result = content;
    let commentsRemoved = 0;

    result = result.replace(/^(\s*)\/\/(?!\s*@|\s*eslint|\s*prettier|\s*webpack|\s*vite).*$/gm, (match, indent) => {

      if (this.isInsideString(content, content.indexOf(match))) {
        return match;
      }
      commentsRemoved++;
      return '';
    });


    result = result.replace(/\/\*[\s\S]*?\*\//g, (match) => {

      if (this.options.preserveJSDoc && match.startsWith('/**')) {
        return match;
      }

      if (match.toLowerCase().includes('license') || 
          match.toLowerCase().includes('copyright') ||
          match.toLowerCase().includes('author')) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });

    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    this.stats.commentsRemoved += commentsRemoved;
    return result;
  }


  removeHTMLComments(content) {
    let commentsRemoved = 0;


    const result = content.replace(/<!--[\s\S]*?-->/g, (match) => {

      if (match.includes('ng-') || 
          match.includes('angular') ||
          match.includes('[if ') ||
          match.includes('<!DOCTYPE')) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });
    
    this.stats.commentsRemoved += commentsRemoved;
    return result;
  }

  /**
   * Remove CSS/SCSS comments
   */
  removeCSSComments(content) {
    let commentsRemoved = 0;

    const result = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {

      if (match.toLowerCase().includes('license') || 
          match.toLowerCase().includes('copyright')) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });
    
    this.stats.commentsRemoved += commentsRemoved;
    return result;
  }

  /**
   * Check if position is inside a string literal
   */
  isInsideString(content, position) {
    const beforePosition = content.substring(0, position);
    const singleQuotes = (beforePosition.match(/'/g) || []).length;
    const doubleQuotes = (beforePosition.match(/"/g) || []).length;
    const backticks = (beforePosition.match(/`/g) || []).length;
    
    return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backticks % 2 === 1);
  }


  printSummary() {
    if (this.options.dryRun) {
    } else {
    }
  }


  static showHelp() {
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options = {
    dryRun: args.includes('--dry-run'),
    preserve: !args.includes('--no-preserve'), // Default to true unless --no-preserve
    verbose: args.includes('--verbose'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    CommentRemover.showHelp();
    return;
  }
  
  const remover = new CommentRemover(options);
  remover.removeCommentsFromCodebase();
}

// Export for testing
module.exports = CommentRemover;

// Run if called directly
if (require.main === module) {
  main();
}
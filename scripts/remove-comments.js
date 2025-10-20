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
    console.log('🧹 Starting comment removal process...\n');
    
    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }
    
    try {
      await this.processDirectory(rootDir);
      this.printSummary();
    } catch (error) {
      console.error('❌ Error during comment removal:', error.message);
      process.exit(1);
    }
  }

  /**
   * Recursively process directory
   */
  async processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {

        if (this.excludeDirs.includes(entry.name)) {
          if (this.options.verbose) {
            console.log(`⏭️  Skipping directory: ${fullPath}`);
          }
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
        
        if (this.options.verbose) {
          console.log(`📝 Processing: ${filePath}`);
        }
        
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

  /**
   * Remove comments from file content based on file type
   */
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

  /**
   * Remove JavaScript/TypeScript comments
   */
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
    
    // Remove multi-line comments ()
    // But preserve JSDoc comments if option is set
    result = result.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      // Preserve JSDoc comments if option is enabled
      if (this.options.preserveJSDoc && match.startsWith('/**')) {
        return match;
      }
      
      // Preserve license headers
      if (match.toLowerCase().includes('license') || 
          match.toLowerCase().includes('copyright') ||
          match.toLowerCase().includes('author')) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });
    
    // Clean up empty lines (but preserve intentional spacing)
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    this.stats.commentsRemoved += commentsRemoved;
    return result;
  }

  /**
   * Remove HTML comments
   */
  removeHTMLComments(content) {
    let commentsRemoved = 0;
    
    // Remove HTML comments <!-- ... -->
    // But preserve Angular comments and conditional comments
    const result = content.replace(/<!--[\s\S]*?-->/g, (match) => {
      // Preserve Angular-specific comments
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
    
    // Remove CSS comments 
    const result = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      // Preserve license headers
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

  /**
   * Print summary of changes
   */
  printSummary() {
    console.log('\n📊 Comment Removal Summary:');
    console.log('═'.repeat(40));
    console.log(`📁 Files processed: ${this.stats.filesProcessed}`);
    console.log(`✏️  Files modified: ${this.stats.filesModified}`);
    console.log(`💬 Comments removed: ${this.stats.commentsRemoved}`);
    console.log(`📄 Lines removed: ${this.stats.linesRemoved}`);
    
    if (this.options.dryRun) {
      console.log('\n🔍 This was a dry run - no files were actually modified');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Comment removal completed successfully!');
    }
    
    console.log('\n💡 Tip: Run your linter/formatter after comment removal to clean up formatting');
  }

  /**
   * Show help message
   */
  static showHelp() {
    console.log(`
🧹 Comment Removal Script for AI E-commerce Platform

This script removes comments from TypeScript, JavaScript, HTML, CSS, and SCSS files
while preserving important documentation like license headers and JSDoc comments.

Usage:
  node scripts/remove-comments.js [options]

Options:
  --dry-run     Show what would be changed without modifying files
  --preserve    Preserve JSDoc comments (/** ... */) [default: true]
  --no-preserve Don't preserve JSDoc comments
  --verbose     Show detailed output for each file processed
  --help        Show this help message

Examples:
  # Dry run to see what would be changed
  node scripts/remove-comments.js --dry-run

  # Remove comments but preserve JSDoc
  node scripts/remove-comments.js --preserve

  # Remove all comments including JSDoc
  node scripts/remove-comments.js --no-preserve

  # Verbose output with dry run
  node scripts/remove-comments.js --dry-run --verbose

Files processed:
  ✅ TypeScript (.ts, .tsx)
  ✅ JavaScript (.js, .jsx)  
  ✅ HTML (.html)
  ✅ CSS (.css)
  ✅ SCSS (.scss)

Preserved comments:
  ✅ License headers
  ✅ Copyright notices
  ✅ JSDoc comments (if --preserve is used)
  ✅ Angular-specific HTML comments
  ✅ Conditional comments

Excluded directories:
  ❌ node_modules, dist, coverage, .git, .nx, .angular, tmp, build

Safety features:
  🔒 Dry run mode to preview changes
  🔒 Preserves important legal and documentation comments
  🔒 Skips binary and configuration files
  🔒 Detailed logging and statistics
`);
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
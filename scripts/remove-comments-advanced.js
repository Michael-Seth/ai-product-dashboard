#!/usr/bin/env node

/**
 * Advanced Comment Removal Script for AI E-commerce Platform
 * 
 * This is an enhanced version that uses configuration files and provides
 * more granular control over comment removal.
 * 
 * Usage:
 *   node scripts/remove-comments-advanced.js [options] [paths...]
 * 
 * Options:
 *   --config <path>  Use custom configuration file
 *   --dry-run        Show what would be changed without modifying files
 *   --preserve       Preserve JSDoc comments (/** ... */)
 *   --verbose        Show detailed output
 *   --pattern <glob> Process only files matching pattern
 *   --exclude <glob> Exclude files matching pattern
 *   --help           Show this help message
 */

const fs = require('fs');
const path = require('path');
// Note: glob is optional - will use simple directory traversal if not available
let glob;
try {
  glob = require('glob').glob;
} catch (e) {
  // Fallback to simple directory traversal
  glob = null;
}

class AdvancedCommentRemover {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      configPath: options.configPath || './scripts/remove-comments.config.js',
      pattern: options.pattern || null,
      exclude: options.exclude || null,
      ...options
    };
    
    // Load configuration
    this.config = this.loadConfig();
    
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      commentsRemoved: 0,
      linesRemoved: 0,
      byFileType: {}
    };
  }

  /**
   * Load configuration file
   */
  loadConfig() {
    try {
      const configPath = path.resolve(this.options.configPath);
      if (fs.existsSync(configPath)) {
        delete require.cache[configPath];
        return require(configPath);
      }
    } catch (error) {
      console.warn(`⚠️  Could not load config file: ${error.message}`);
    }
    
    // Return default configuration
    return require('./remove-comments.config.js');
  }

  /**
   * Main entry point
   */
  async removeComments(paths = ['.']) {
    console.log('🧹 Starting advanced comment removal process...\n');
    
    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }
    
    try {
      for (const targetPath of paths) {
        await this.processPath(targetPath);
      }
      this.printSummary();
    } catch (error) {
      console.error('❌ Error during comment removal:', error.message);
      process.exit(1);
    }
  }

  /**
   * Process a single path (file or directory)
   */
  async processPath(targetPath) {
    const stat = fs.statSync(targetPath);
    
    if (stat.isFile()) {
      await this.processFile(targetPath);
    } else if (stat.isDirectory()) {
      await this.processDirectory(targetPath);
    }
  }

  /**
   * Process directory with glob patterns or simple traversal
   */
  async processDirectory(dirPath) {
    if (glob && this.options.pattern) {
      // Use glob if available and pattern specified
      await this.processDirectoryWithGlob(dirPath);
    } else {
      // Use simple directory traversal
      await this.processDirectorySimple(dirPath);
    }
  }

  /**
   * Process directory with glob patterns
   */
  async processDirectoryWithGlob(dirPath) {
    const pattern = this.options.pattern || `**/*.{${this.config.extensions.map(ext => ext.slice(1)).join(',')}}`;
    const fullPattern = path.join(dirPath, pattern);
    
    const ignore = [
      ...this.config.excludeDirs.map(dir => `**/${dir}/**`),
      ...this.config.excludeFiles.map(file => `**/${file}`)
    ];
    
    if (this.options.exclude) {
      ignore.push(this.options.exclude);
    }
    
    try {
      const files = await glob(fullPattern, { 
        ignore,
        nodir: true,
        absolute: true
      });
      
      for (const file of files) {
        await this.processFile(file);
      }
    } catch (error) {
      console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Process directory with simple traversal
   */
  async processDirectorySimple(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (this.config.excludeDirs.includes(entry.name)) {
          if (this.options.verbose) {
            console.log(`⏭️  Skipping directory: ${fullPath}`);
          }
          continue;
        }
        
        await this.processDirectorySimple(fullPath);
      } else if (entry.isFile()) {
        // Skip excluded files
        if (this.config.excludeFiles.includes(entry.name)) {
          continue;
        }
        
        // Check extension
        const fileExt = path.extname(entry.name);
        if (this.config.extensions.includes(fileExt)) {
          await this.processFile(fullPath);
        }
      }
    }
  }

  /**
   * Process individual file
   */
  async processFile(filePath) {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);
    
    // Skip if extension not supported
    if (!this.config.extensions.includes(fileExt)) {
      return;
    }
    
    this.stats.filesProcessed++;
    
    // Initialize file type stats
    if (!this.stats.byFileType[fileExt]) {
      this.stats.byFileType[fileExt] = {
        processed: 0,
        modified: 0,
        commentsRemoved: 0
      };
    }
    this.stats.byFileType[fileExt].processed++;
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const processedContent = this.removeCommentsFromContent(originalContent, fileExt, filePath);
      
      if (originalContent !== processedContent) {
        this.stats.filesModified++;
        this.stats.byFileType[fileExt].modified++;
        
        if (this.options.verbose) {
          console.log(`📝 Processing: ${filePath}`);
        }
        
        if (!this.options.dryRun) {
          // Create backup if needed
          if (this.config.output.createBackups) {
            fs.writeFileSync(`${filePath}.backup`, originalContent, 'utf8');
          }
          
          fs.writeFileSync(filePath, processedContent, 'utf8');
        }
        
        // Count removed lines
        const originalLines = originalContent.split('\n').length;
        const processedLines = processedContent.split('\n').length;
        this.stats.linesRemoved += (originalLines - processedLines);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Remove comments from content with advanced rules
   */
  removeCommentsFromContent(content, fileExt, filePath) {
    const fileName = path.basename(filePath);
    
    // Check for special file patterns
    const filePattern = this.getFilePattern(fileName);
    
    switch (fileExt) {
      case '.ts':
      case '.tsx':
        return this.removeTypeScriptComments(content, filePattern);
      case '.js':
      case '.jsx':
        return this.removeJavaScriptComments(content, filePattern);
      case '.html':
        return this.removeHTMLComments(content, filePattern);
      case '.css':
      case '.scss':
        return this.removeCSSComments(content, filePattern);
      default:
        return content;
    }
  }

  /**
   * Get file pattern configuration
   */
  getFilePattern(fileName) {
    for (const [patternName, patternConfig] of Object.entries(this.config.filePatterns)) {
      if (patternConfig.pattern.test(fileName)) {
        return { name: patternName, ...patternConfig };
      }
    }
    return null;
  }

  /**
   * Remove TypeScript comments with advanced rules
   */
  removeTypeScriptComments(content, filePattern) {
    let result = content;
    let commentsRemoved = 0;
    
    const rules = this.config.customRules['.ts'] || {};
    
    // Remove single-line comments
    result = result.replace(/^(\s*)\/\/(?!\s*@|\s*eslint|\s*prettier).*$/gm, (match, indent) => {
      // Check preserve patterns
      for (const pattern of this.config.preservePatterns.js) {
        if (pattern.test(match)) {
          return match;
        }
      }
      
      // Preserve TODOs if configured
      if (rules.preserveTodos && /\/\/\s*(TODO|FIXME|NOTE):/i.test(match)) {
        return match;
      }
      
      // Skip if inside string
      if (this.isInsideString(content, content.indexOf(match))) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });
    
    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      // Check preserve patterns
      for (const pattern of this.config.preservePatterns.js) {
        if (pattern.test(match)) {
          return match;
        }
      }
      
      // Preserve JSDoc if configured
      if (rules.preserveJSDoc && match.startsWith('/**')) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });
    
    // Clean up formatting
    result = this.cleanupFormatting(result);
    
    this.stats.commentsRemoved += commentsRemoved;
    if (this.stats.byFileType['.ts']) {
      this.stats.byFileType['.ts'].commentsRemoved += commentsRemoved;
    }
    
    return result;
  }

  /**
   * Remove JavaScript comments
   */
  removeJavaScriptComments(content, filePattern) {
    // Similar to TypeScript but with JS-specific rules
    return this.removeTypeScriptComments(content, filePattern);
  }

  /**
   * Remove HTML comments with advanced rules
   */
  removeHTMLComments(content, filePattern) {
    let commentsRemoved = 0;
    const rules = this.config.customRules['.html'] || {};
    
    const result = content.replace(/<!--[\s\S]*?-->/g, (match) => {
      // Check preserve patterns
      for (const pattern of this.config.preservePatterns.html) {
        if (pattern.test(match)) {
          return match;
        }
      }
      
      // Preserve Angular comments if configured
      if (rules.preserveAngularComments && 
          (match.includes('ng-') || match.includes('angular'))) {
        return match;
      }
      
      // Preserve conditional comments if configured
      if (rules.preserveConditionalComments && match.includes('[if ')) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });
    
    this.stats.commentsRemoved += commentsRemoved;
    if (this.stats.byFileType['.html']) {
      this.stats.byFileType['.html'].commentsRemoved += commentsRemoved;
    }
    
    return result;
  }

  /**
   * Remove CSS/SCSS comments with advanced rules
   */
  removeCSSComments(content, filePattern) {
    let commentsRemoved = 0;
    const rules = this.config.customRules['.css'] || this.config.customRules['.scss'] || {};
    
    const result = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      // Check preserve patterns
      for (const pattern of this.config.preservePatterns.css) {
        if (pattern.test(match)) {
          return match;
        }
      }
      
      // Preserve license headers if configured
      if (rules.preserveLicenseHeaders && 
          (match.toLowerCase().includes('license') || 
           match.toLowerCase().includes('copyright'))) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });
    
    this.stats.commentsRemoved += commentsRemoved;
    const ext = content.includes('@') ? '.scss' : '.css';
    if (this.stats.byFileType[ext]) {
      this.stats.byFileType[ext].commentsRemoved += commentsRemoved;
    }
    
    return result;
  }

  /**
   * Clean up formatting after comment removal
   */
  cleanupFormatting(content) {
    // Remove excessive empty lines
    return content
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // Max 2 consecutive empty lines
      .replace(/^\s*\n/, '')  // Remove leading empty lines
      .replace(/\n\s*$/, '\n');  // Ensure single trailing newline
  }

  /**
   * Check if position is inside a string literal
   */
  isInsideString(content, position) {
    const beforePosition = content.substring(0, position);
    const singleQuotes = (beforePosition.match(/(?<!\\)'/g) || []).length;
    const doubleQuotes = (beforePosition.match(/(?<!\\)"/g) || []).length;
    const backticks = (beforePosition.match(/(?<!\\)`/g) || []).length;
    
    return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backticks % 2 === 1);
  }

  /**
   * Print detailed summary
   */
  printSummary() {
    console.log('\n📊 Advanced Comment Removal Summary:');
    console.log('═'.repeat(50));
    console.log(`📁 Files processed: ${this.stats.filesProcessed}`);
    console.log(`✏️  Files modified: ${this.stats.filesModified}`);
    console.log(`💬 Comments removed: ${this.stats.commentsRemoved}`);
    console.log(`📄 Lines removed: ${this.stats.linesRemoved}`);
    
    // Show breakdown by file type
    console.log('\n📋 Breakdown by file type:');
    for (const [ext, stats] of Object.entries(this.stats.byFileType)) {
      if (stats.processed > 0) {
        console.log(`  ${ext}: ${stats.processed} processed, ${stats.modified} modified, ${stats.commentsRemoved} comments removed`);
      }
    }
    
    if (this.options.dryRun) {
      console.log('\n🔍 This was a dry run - no files were actually modified');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Advanced comment removal completed successfully!');
    }
    
    console.log('\n💡 Recommendations:');
    console.log('   • Run your linter/formatter after comment removal');
    console.log('   • Review changes before committing');
    console.log('   • Consider running tests to ensure functionality');
  }

  /**
   * Show help message
   */
  static showHelp() {
    console.log(`
🧹 Advanced Comment Removal Script for AI E-commerce Platform

Enhanced version with configuration support and granular control.

Usage:
  node scripts/remove-comments-advanced.js [options] [paths...]

Options:
  --config <path>   Use custom configuration file (default: ./scripts/remove-comments.config.js)
  --dry-run         Show what would be changed without modifying files
  --verbose         Show detailed output for each file processed
  --pattern <glob>  Process only files matching glob pattern
  --exclude <glob>  Exclude files matching glob pattern
  --help            Show this help message

Examples:
  # Process entire codebase with default config
  node scripts/remove-comments-advanced.js

  # Dry run with verbose output
  node scripts/remove-comments-advanced.js --dry-run --verbose

  # Process only TypeScript files
  node scripts/remove-comments-advanced.js --pattern "**/*.ts"

  # Process specific directory
  node scripts/remove-comments-advanced.js src/app

  # Use custom configuration
  node scripts/remove-comments-advanced.js --config ./my-config.js

Configuration:
  The script uses remove-comments.config.js for advanced configuration including:
  • File type specific rules
  • Preserve patterns for important comments
  • Custom file pattern handling
  • Output options

Safety Features:
  🔒 Dry run mode to preview changes
  🔒 Configurable preserve patterns
  🔒 File type specific handling
  🔒 Detailed statistics and logging
  🔒 Backup creation (if configured)
`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  // Parse config option
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    options.configPath = args[configIndex + 1];
  }
  
  // Parse pattern option
  const patternIndex = args.indexOf('--pattern');
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    options.pattern = args[patternIndex + 1];
  }
  
  // Parse exclude option
  const excludeIndex = args.indexOf('--exclude');
  if (excludeIndex !== -1 && args[excludeIndex + 1]) {
    options.exclude = args[excludeIndex + 1];
  }
  
  if (options.help) {
    AdvancedCommentRemover.showHelp();
    return;
  }
  
  // Get paths to process
  const paths = args.filter(arg => 
    !arg.startsWith('--') && 
    !args[args.indexOf(arg) - 1]?.startsWith('--')
  );
  
  const remover = new AdvancedCommentRemover(options);
  await remover.removeComments(paths.length > 0 ? paths : ['.']);
}

// Export for testing
module.exports = AdvancedCommentRemover;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
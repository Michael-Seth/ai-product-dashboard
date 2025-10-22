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
 *   --preserve       Preserve JSDoc comments (/** ... 
 *   --verbose        Show detailed output
 *   --pattern <glob> Process only files matching pattern
 *   --exclude <glob> Exclude files matching pattern
 *   --help           Show this help message
 */

const fs = require('fs');
const path = require('path');

let glob;
try {
  glob = require('glob').glob;
} catch (e) {

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
      console.warn(`️ Could not load config file: ${error.message}`);
    }

    return require('./remove-comments.config.js');
  }

  /**
   * Main entry point
   */
  async removeComments(paths = ['.']) {
    if (this.options.dryRun) {
    }
    
    try {
      for (const targetPath of paths) {
        await this.processPath(targetPath);
      }
      this.printSummary();
    } catch (error) {
      console.error(' Error during comment removal:', error.message);
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

      await this.processDirectoryWithGlob(dirPath);
    } else {

      await this.processDirectorySimple(dirPath);
    }
  }

  /**
   * Process directory with glob patterns
   */
  async processDirectoryWithGlob(dirPath) {
    const fullPattern = this.options.pattern || `${dirPath}/**/*`;
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
      console.error(` Error processing directory ${dirPath}:`, error.message);
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

        if (this.config.excludeDirs.includes(entry.name)) {
          if (this.options.verbose) {
          }
          continue;
        }
        
        await this.processDirectorySimple(fullPath);
      } else if (entry.isFile()) {

        if (this.config.excludeFiles.includes(entry.name)) {
          continue;
        }

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

    if (!this.config.extensions.includes(fileExt)) {
      return;
    }
    
    this.stats.filesProcessed++;

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
        }
        
        if (!this.options.dryRun) {

          if (this.config.output.createBackups) {
            fs.writeFileSync(`${filePath}.backup`, originalContent, 'utf8');
          }
          
          fs.writeFileSync(filePath, processedContent, 'utf8');
        }

        const originalLines = originalContent.split('\n').length;
        const processedLines = processedContent.split('\n').length;
        this.stats.linesRemoved += (originalLines - processedLines);
      }
    } catch (error) {
      console.error(` Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Remove comments from content with advanced rules
   */
  removeCommentsFromContent(content, fileExt, filePath) {
    const fileName = path.basename(filePath);

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

    result = result.replace(/^(\s*)\/\/(?!\s*@|\s*eslint|\s*prettier).*$/gm, (match, indent) => {

      for (const pattern of this.config.preservePatterns.js) {
        if (pattern.test(match)) {
          return match;
        }
      }

      if (rules.preserveTodos && /\/\/\s*(TODO|FIXME|NOTE):/i.test(match)) {
        return match;
      }

      if (this.isInsideString(content, content.indexOf(match))) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });

    result = result.replace(/\/\*[\s\S]*?\*\//g, (match) => {

      for (const pattern of this.config.preservePatterns.js) {
        if (pattern.test(match)) {
          return match;
        }
      }

      if (rules.preserveJSDoc && match.startsWith('/**')) {
        return match;
      }
      
      commentsRemoved++;
      return '';
    });

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

    return this.removeTypeScriptComments(content, filePattern);
  }

  /**
   * Remove HTML comments with advanced rules
   */
  removeHTMLComments(content, filePattern) {
    let commentsRemoved = 0;
    const rules = this.config.customRules['.html'] || {};
    
    const result = content.replace(/<!--[\s\S]*?-->/g, (match) => {

      for (const pattern of this.config.preservePatterns.html) {
        if (pattern.test(match)) {
          return match;
        }
      }

      if (rules.preserveAngularComments && 
          (match.includes('ng-') || match.includes('angular'))) {
        return match;
      }

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

      for (const pattern of this.config.preservePatterns.css) {
        if (pattern.test(match)) {
          return match;
        }
      }

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
    // Show breakdown by file type
    for (const [ext, stats] of Object.entries(this.stats.byFileType)) {
      if (stats.processed > 0) {
      }
    }
    
    if (this.options.dryRun) {
    } else {
    }
  }

  /**
   * Show help message
   */
  static showHelp() {
  --dry-run        Show what would be changed without modifying files
  --verbose        Show detailed output for each file processed
  --pattern <glob> Process only files matching glob pattern
  --exclude <glob> Exclude files matching glob pattern
  --help           Show this help message

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
  ✓ Dry run mode to preview changes
  ✓ Configurable preserve patterns
  ✓ File type specific handling
  ✓ Detailed statistics and logging
  ✓ Backup creation (if configured)
    `); } } 
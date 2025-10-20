#!/usr/bin/env node

/**
 * Advanced Console.log Removal Script for AI E-commerce Platform
 * 
 * Enhanced version with configuration support and granular control over
 * console statement removal with environment-specific rules.
 * 
 * Usage:
 *   node scripts/remove-console-logs-advanced.js [options] [paths...]
 * 
 * Options:
 *   --config <path>    Use custom configuration file
 *   --dry-run          Show what would be changed without modifying files
 *   --env <env>        Target environment (development, production, test)
 *   --preserve-errors  Preserve console.error and console.warn
 *   --remove-all       Remove all console statements
 *   --verbose          Show detailed output
 *   --pattern <glob>   Process only files matching pattern
 *   --help             Show this help message
 */

const fs = require('fs');
const path = require('path');

class AdvancedConsoleLogRemover {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      configPath: options.configPath || './scripts/remove-console-logs.config.js',
      environment: options.env || 'production',
      preserveErrors: options.preserveErrors || false,
      removeAll: options.removeAll || false,
      pattern: options.pattern || null,
      ...options
    };
    this.config = this.loadConfig();
    
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      consoleStatementsRemoved: 0,
      linesRemoved: 0,
      byMethod: {},
      byFileType: {},
      preserved: 0
    };
    const allMethods = [
      ...this.config.consoleMethods.remove,
      ...this.config.consoleMethods.preserve,
      ...this.config.consoleMethods.conditionalRemove
    ];
    
    allMethods.forEach(method => {
      this.stats.byMethod[method] = { removed: 0, preserved: 0 };
    });
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
    return require('./remove-console-logs.config.js');
  }

  /**
   * Main entry point
   */
  async removeConsoleLogs(paths = ['.']) {
    console.log('🧹 Starting advanced console.log removal process...\n');
    
    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }
    
    console.log(`🎯 Target environment: ${this.options.environment}\n`);
    
    try {
      for (const targetPath of paths) {
        await this.processPath(targetPath);
      }
      this.printSummary();
    } catch (error) {
      console.error('❌ Error during console.log removal:', error.message);
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
   * Process directory
   */
  async processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (this.config.excludeDirs.includes(entry.name)) {
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
    if (this.config.excludeFiles.includes(fileName)) {
      return;
    }
    if (!this.config.extensions.includes(fileExt)) {
      return;
    }
    if (this.options.pattern && !fileName.match(new RegExp(this.options.pattern))) {
      return;
    }
    
    this.stats.filesProcessed++;
    if (!this.stats.byFileType[fileExt]) {
      this.stats.byFileType[fileExt] = {
        processed: 0,
        modified: 0,
        removed: 0
      };
    }
    this.stats.byFileType[fileExt].processed++;
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const processedContent = this.removeConsoleStatements(originalContent, filePath);
      
      if (originalContent !== processedContent) {
        this.stats.filesModified++;
        this.stats.byFileType[fileExt].modified++;
        
        if (this.options.verbose) {
          console.log(`📝 Processing: ${filePath}`);
        }
        
        if (!this.options.dryRun) {
          if (this.config.output.createBackups) {
            fs.writeFileSync(`${filePath}.backup`, originalContent, 'utf8');
          }
          
          fs.writeFileSync(filePath, processedContent, 'utf8');
        }
        const originalLines = originalContent.split('\n').length;
        const processedLines = processedContent.split('\n').length;
        const linesRemoved = originalLines - processedLines;
        this.stats.linesRemoved += linesRemoved;
        this.stats.byFileType[fileExt].removed += linesRemoved;
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Remove console statements with advanced rules
   */
  removeConsoleStatements(content, filePath) {
    const fileName = path.basename(filePath);
    const fileRule = this.getFileRule(fileName);
    const envRule = this.config.environments[this.options.environment] || {};
    
    let result = content;
    let totalRemoved = 0;
    const methodsToRemove = this.getMethodsToRemove(fileRule, envRule);
    
    if (methodsToRemove.length === 0) {
      return content;
    }
    const methodsPattern = methodsToRemove.join('|');
    result = this.removeSimpleConsoleStatements(result, methodsPattern);
    result = this.removeComplexConsoleStatements(result, methodsPattern);
    result = this.removeMultiLineConsoleStatements(result, methodsPattern);
    if (this.config.advanced.handleTemplateLiterals) {
      result = this.removeConsoleInTemplateLiterals(result, methodsPattern);
    }
    
    if (this.config.advanced.handleObjectMethods) {
      result = this.removeConsoleInObjectMethods(result, methodsPattern);
    }
    
    if (this.config.advanced.handleChainedCalls) {
      result = this.removeChainedConsoleCalls(result, methodsPattern);
    }
    if (this.config.replacement.cleanupEmptyLines) {
      result = this.cleanupEmptyLines(result);
    }
    
    return result;
  }

  /**
   * Get file-specific rule
   */
  getFileRule(fileName) {
    for (const [ruleName, rule] of Object.entries(this.config.fileRules)) {
      if (rule.pattern.test(fileName)) {
        return { name: ruleName, ...rule };
      }
    }
    return null;
  }

  /**
   * Determine which console methods to remove based on rules
   */
  getMethodsToRemove(fileRule, envRule) {
    let methodsToRemove = [...this.config.consoleMethods.remove];
    if (this.options.removeAll || envRule.removeAll) {
      methodsToRemove = [
        ...this.config.consoleMethods.remove,
        ...this.config.consoleMethods.preserve,
        ...this.config.consoleMethods.conditionalRemove
      ];
    } else {
      if (this.options.environment === 'production') {
        methodsToRemove.push(...this.config.consoleMethods.conditionalRemove);
      }
      if (!this.options.preserveErrors && !envRule.preserveErrors) {
        methodsToRemove.push(...this.config.consoleMethods.preserve);
      }
    }
    if (fileRule) {
      if (fileRule.preserveAll) {
        return [];
      }
      
      if (fileRule.preserveDebug) {
        methodsToRemove = methodsToRemove.filter(method => 
          !['debug', 'trace'].includes(method)
        );
      }
      
      if (fileRule.preserveInfo) {
        methodsToRemove = methodsToRemove.filter(method => 
          method !== 'info'
        );
      }
    }
    
    return methodsToRemove;
  }

  /**
   * Remove simple console statements
   */
  removeSimpleConsoleStatements(content, methodsPattern) {
    const regex = new RegExp(
      `^(\\s*)console\\.(${methodsPattern})\\s*\\([^;]*?\\);?\\s*$`,
      'gm'
    );
    
    return content.replace(regex, (match, indent, method) => {
      if (this.shouldPreserveStatement(match, method)) {
        this.stats.byMethod[method].preserved++;
        this.stats.preserved++;
        return match;
      }
      
      this.stats.byMethod[method].removed++;
      this.stats.consoleStatementsRemoved++;
      
      return this.config.replacement.preserveIndentation ? 
        this.config.replacement.replaceWith : 
        '';
    });
  }

  /**
   * Remove complex console statements
   */
  removeComplexConsoleStatements(content, methodsPattern) {
    const regex = new RegExp(
      `^(\\s*)console\\.(${methodsPattern})\\s*\\((?:[^)(]|\\([^)]*\\))*\\);?\\s*$`,
      'gm'
    );
    
    return content.replace(regex, (match, indent, method) => {
      if (this.shouldPreserveStatement(match, method)) {
        this.stats.byMethod[method].preserved++;
        this.stats.preserved++;
        return match;
      }
      
      this.stats.byMethod[method].removed++;
      this.stats.consoleStatementsRemoved++;
      
      return this.config.replacement.preserveIndentation ? 
        indent + this.config.replacement.replaceWith : 
        this.config.replacement.replaceWith;
    });
  }

  /**
   * Remove multi-line console statements
   */
  removeMultiLineConsoleStatements(content, methodsPattern) {
    const lines = content.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      const consoleMatch = trimmedLine.match(
        new RegExp(`^console\\.(${methodsPattern})\\s*\\(`)
      );
      
      if (consoleMatch) {
        const method = consoleMatch[1];
        
        if (this.shouldPreserveStatement(line, method)) {
          result.push(line);
          i++;
          continue;
        }
        const endIndex = this.findConsoleStatementEnd(lines, i);
        
        if (endIndex > i) {
          this.stats.byMethod[method].removed++;
          this.stats.consoleStatementsRemoved++;
          i = endIndex + 1;
        } else {
          result.push(line);
          i++;
        }
      } else {
        result.push(line);
        i++;
      }
    }

    return result.join('\n');
  }

  /**
   * Find the end of a multi-line console statement
   */
  findConsoleStatementEnd(lines, startIndex) {
    let openParens = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const prevChar = j > 0 ? line[j - 1] : '';
        
        if (!inString) {
          if (char === '"' || char === "'" || char === '`') {
            inString = true;
            stringChar = char;
          } else if (char === '(') {
            openParens++;
          } else if (char === ')') {
            openParens--;
            if (openParens === 0) {
              return i;
            }
          }
        } else {
          if (char === stringChar && prevChar !== '\\') {
            inString = false;
            stringChar = '';
          }
        }
      }
    }
    
    return startIndex; // Couldn't find end
  }

  /**
   * Remove console statements in template literals
   */
  removeConsoleInTemplateLiterals(content, methodsPattern) {
    // Handle console statements inside template literals
    const regex = new RegExp(
      `\\$\\{[^}]*console\\.(${methodsPattern})\\([^}]*\\)\\}`,
      'g'
    );
    
    return content.replace(regex, (match) => {
      // Extract method name
      const methodMatch = match.match(new RegExp(`console\\.(${methodsPattern})`));
      if (methodMatch) {
        const method = methodMatch[1];
        
        if (this.shouldPreserveStatement(match, method)) {
          this.stats.byMethod[method].preserved++;
          this.stats.preserved++;
          return match;
        }
        
        this.stats.byMethod[method].removed++;
        this.stats.consoleStatementsRemoved++;
        return '${undefined}'; // Replace with undefined in template literal
      }
      
      return match;
    });
  }

  /**
   * Remove console statements in object methods
   */
  removeConsoleInObjectMethods(content, methodsPattern) {
    // This is a simplified implementation
    // In practice, you might want to use an AST parser for more accuracy
    return content;
  }

  /**
   * Remove chained console calls
   */
  removeChainedConsoleCalls(content, methodsPattern) {
    // Handle chained calls like console.log().log()
    const regex = new RegExp(
      `console\\.(${methodsPattern})\\([^)]*\\)(?:\\.\\w+\\([^)]*\\))*`,
      'g'
    );
    
    return content.replace(regex, (match) => {
      const methodMatch = match.match(new RegExp(`console\\.(${methodsPattern})`));
      if (methodMatch) {
        const method = methodMatch[1];
        
        if (this.shouldPreserveStatement(match, method)) {
          this.stats.byMethod[method].preserved++;
          this.stats.preserved++;
          return match;
        }
        
        this.stats.byMethod[method].removed++;
        this.stats.consoleStatementsRemoved++;
        return '';
      }
      
      return match;
    });
  }

  /**
   * Check if console statement should be preserved
   */
  shouldPreserveStatement(statement, method) {
    // Check preserve patterns
    for (const pattern of this.config.preservePatterns) {
      if (pattern.test(statement)) {
        return true;
      }
    }
    
    // Check if method should be preserved
    if (this.config.consoleMethods.preserve.includes(method) && 
        (this.options.preserveErrors || !this.options.removeAll)) {
      return true;
    }
    
    return false;
  }

  /**
   * Clean up empty lines
   */
  cleanupEmptyLines(content) {
    const maxEmpty = this.config.replacement.maxEmptyLines;
    const emptyLineRegex = new RegExp(`\\n\\s*\\n{${maxEmpty},}`, 'g');
    
    return content
      .replace(emptyLineRegex, '\n'.repeat(maxEmpty + 1))
      .replace(/^\s*\n/, '') // Remove leading empty lines
      .replace(/\n\s*$/, '\n'); // Ensure single trailing newline
  }

  /**
   * Print detailed summary
   */
  printSummary() {
    console.log('\n📊 Advanced Console.log Removal Summary:');
    console.log('═'.repeat(55));
    console.log(`📁 Files processed: ${this.stats.filesProcessed}`);
    console.log(`✏️  Files modified: ${this.stats.filesModified}`);
    console.log(`🖥️  Console statements removed: ${this.stats.consoleStatementsRemoved}`);
    console.log(`🛡️  Console statements preserved: ${this.stats.preserved}`);
    console.log(`📄 Lines removed: ${this.stats.linesRemoved}`);
    
    // Show breakdown by method
    console.log('\n📋 Breakdown by console method:');
    for (const [method, stats] of Object.entries(this.stats.byMethod)) {
      if (stats.removed > 0 || stats.preserved > 0) {
        console.log(`  console.${method}: ${stats.removed} removed, ${stats.preserved} preserved`);
      }
    }
    
    // Show breakdown by file type
    console.log('\n📁 Breakdown by file type:');
    for (const [ext, stats] of Object.entries(this.stats.byFileType)) {
      if (stats.processed > 0) {
        console.log(`  ${ext}: ${stats.processed} processed, ${stats.modified} modified, ${stats.removed} lines removed`);
      }
    }
    
    if (this.options.dryRun) {
      console.log('\n🔍 This was a dry run - no files were actually modified');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Advanced console.log removal completed successfully!');
    }
    
    console.log('\n💡 Recommendations:');
    console.log('   • Run tests to ensure functionality after removal');
    console.log('   • Consider implementing a proper logging library');
    console.log('   • Review preserved statements for production readiness');
  }

  /**
   * Show help message
   */
  static showHelp() {
    console.log(`
🧹 Advanced Console.log Removal Script for AI E-commerce Platform

Enhanced version with configuration support and environment-specific rules.

Usage:
  node scripts/remove-console-logs-advanced.js [options] [paths...]

Options:
  --config <path>       Use custom configuration file
  --dry-run             Show what would be changed without modifying files
  --env <environment>   Target environment (development, production, test)
  --preserve-errors     Preserve console.error and console.warn
  --remove-all          Remove all console statements
  --verbose             Show detailed output
  --pattern <regex>     Process only files matching pattern
  --help                Show this help message

Examples:
  # Production build (removes most console statements)
  node scripts/remove-console-logs-advanced.js --env production

  # Development cleanup (preserves debug info)
  node scripts/remove-console-logs-advanced.js --env development

  # Remove everything except errors
  node scripts/remove-console-logs-advanced.js --preserve-errors

  # Process only TypeScript files
  node scripts/remove-console-logs-advanced.js --pattern "\\.ts$"

  # Use custom configuration
  node scripts/remove-console-logs-advanced.js --config ./my-console-config.js

Configuration Features:
  🎯 Environment-specific rules (dev, prod, test)
  🎯 File-type specific handling
  🎯 Preserve patterns for important statements
  🎯 Advanced console statement detection
  🎯 Backup creation and cleanup options

Safety Features:
  🔒 Dry run mode for safe testing
  🔒 Configurable preserve patterns
  🔒 Environment-aware processing
  🔒 Detailed statistics and reporting
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
    preserveErrors: args.includes('--preserve-errors'),
    removeAll: args.includes('--remove-all'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  // Parse config option
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    options.configPath = args[configIndex + 1];
  }
  
  // Parse environment option
  const envIndex = args.indexOf('--env');
  if (envIndex !== -1 && args[envIndex + 1]) {
    options.env = args[envIndex + 1];
  }
  
  // Parse pattern option
  const patternIndex = args.indexOf('--pattern');
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    options.pattern = args[patternIndex + 1];
  }
  
  if (options.help) {
    AdvancedConsoleLogRemover.showHelp();
    return;
  }
  
  // Get paths to process
  const paths = args.filter(arg => 
    !arg.startsWith('--') && 
    !args[args.indexOf(arg) - 1]?.startsWith('--')
  );
  
  const remover = new AdvancedConsoleLogRemover(options);
  await remover.removeConsoleLogs(paths.length > 0 ? paths : ['.']);
}

// Export for testing
module.exports = AdvancedConsoleLogRemover;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
#!/usr/bin/env node

/**
 * Console.log Removal Script for AI E-commerce Platform
 * 
 * This script removes console.log, console.warn, console.error, and other console statements
 * from TypeScript and JavaScript files while preserving important logging in production code.
 * 
 * Usage:
 *   node scripts/remove-console-logs.js [options]
 * 
 * Options:
 *   --dry-run      Show what would be changed without modifying files
 *   --preserve     Preserve console.error and console.warn statements
 *   --all          Remove all console statements including error/warn
 *   --verbose      Show detailed output
 *   --help         Show this help message
 */

const fs = require('fs');
const path = require('path');

class ConsoleLogRemover {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      preserveErrors: options.preserve !== false, // Default to true
      removeAll: options.all || false,
      verbose: options.verbose || false,
      ...options
    };
    
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      consoleStatementsRemoved: 0,
      linesRemoved: 0,
      byType: {
        'console.log': 0,
        'console.debug': 0,
        'console.info': 0,
        'console.warn': 0,
        'console.error': 0,
        'console.trace': 0,
        'console.table': 0,
        'console.group': 0,
        'console.time': 0
      }
    };
    
    // File extensions to process
    this.extensions = ['.ts', '.js', '.tsx', '.jsx'];
    
    // Directories to exclude
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
    
    // Files to exclude
    this.excludeFiles = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'angular.json',
      'nx.json'
    ];

    // Console methods to target
    this.consoleMethods = this.options.removeAll 
      ? ['log', 'debug', 'info', 'warn', 'error', 'trace', 'table', 'group', 'groupEnd', 'time', 'timeEnd']
      : this.options.preserveErrors 
        ? ['log', 'debug', 'info', 'trace', 'table', 'group', 'groupEnd', 'time', 'timeEnd']
        : ['log', 'debug', 'info', 'warn', 'error', 'trace', 'table', 'group', 'groupEnd', 'time', 'timeEnd'];
  }

  /**
   * Main entry point - removes console statements from the entire codebase
   */
  async removeConsoleLogsFromCodebase(rootDir = '.') {
    console.log('🧹 Starting console.log removal process...\n');
    
    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    if (this.options.removeAll) {
      console.log('⚠️  REMOVE ALL MODE - All console statements will be removed\n');
    } else if (this.options.preserveErrors) {
      console.log('🛡️  PRESERVE MODE - console.error and console.warn will be preserved\n');
    }
    
    try {
      await this.processDirectory(rootDir);
      this.printSummary();
    } catch (error) {
      console.error('❌ Error during console.log removal:', error.message);
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
        // Skip excluded directories
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
    
    // Skip excluded files
    if (this.excludeFiles.includes(fileName)) {
      return;
    }
    
    // Only process supported file types
    if (!this.extensions.includes(fileExt)) {
      return;
    }
    
    this.stats.filesProcessed++;
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const processedContent = this.removeConsoleStatements(originalContent);
      
      if (originalContent !== processedContent) {
        this.stats.filesModified++;
        
        if (this.options.verbose) {
          console.log(`📝 Processing: ${filePath}`);
        }
        
        if (!this.options.dryRun) {
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
   * Remove console statements from content
   */
  removeConsoleStatements(content) {
    let result = content;
    let totalRemoved = 0;

    // Create regex pattern for console methods
    const methodsPattern = this.consoleMethods.join('|');
    
    // Pattern to match console statements
    // Matches: console.log(...), console.error(...), etc.
    // Handles multi-line statements and various formatting
    const consoleRegex = new RegExp(
      `^(\\s*)console\\.(${methodsPattern})\\s*\\([^;]*?\\);?\\s*$`,
      'gm'
    );

    // More comprehensive pattern for complex console statements
    const complexConsoleRegex = new RegExp(
      `^(\\s*)console\\.(${methodsPattern})\\s*\\((?:[^)(]|\\([^)]*\\))*\\);?\\s*$`,
      'gm'
    );

    // Pattern for multi-line console statements
    const multiLineConsoleRegex = new RegExp(
      `^(\\s*)console\\.(${methodsPattern})\\s*\\([\\s\\S]*?\\);?\\s*$`,
      'gm'
    );

    // Remove simple console statements
    result = result.replace(consoleRegex, (match, indent, method) => {
      if (this.shouldPreserveConsoleStatement(match, method)) {
        return match;
      }
      
      this.stats.byType[`console.${method}`]++;
      totalRemoved++;
      return '';
    });

    // Remove complex console statements (with nested parentheses)
    result = result.replace(complexConsoleRegex, (match, indent, method) => {
      if (this.shouldPreserveConsoleStatement(match, method)) {
        return match;
      }
      
      this.stats.byType[`console.${method}`]++;
      totalRemoved++;
      return '';
    });

    // Handle multi-line console statements
    result = this.removeMultiLineConsoleStatements(result, totalRemoved);

    // Clean up empty lines
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');

    this.stats.consoleStatementsRemoved += totalRemoved;
    return result;
  }

  /**
   * Remove multi-line console statements
   */
  removeMultiLineConsoleStatements(content, currentRemoved) {
    const lines = content.split('\n');
    const result = [];
    let i = 0;
    let removed = currentRemoved;

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check if line starts a console statement
      const consoleMatch = trimmedLine.match(new RegExp(`^console\\.(${this.consoleMethods.join('|')})\\s*\\(`));
      
      if (consoleMatch) {
        const method = consoleMatch[1];
        
        if (this.shouldPreserveConsoleStatement(line, method)) {
          result.push(line);
          i++;
          continue;
        }

        // Find the end of the console statement
        let openParens = 0;
        let inString = false;
        let stringChar = '';
        let j = i;
        let foundEnd = false;

        for (j = i; j < lines.length; j++) {
          const currentLine = lines[j];
          
          for (let k = 0; k < currentLine.length; k++) {
            const char = currentLine[k];
            
            if (!inString) {
              if (char === '"' || char === "'" || char === '`') {
                inString = true;
                stringChar = char;
              } else if (char === '(') {
                openParens++;
              } else if (char === ')') {
                openParens--;
                if (openParens === 0) {
                  foundEnd = true;
                  break;
                }
              }
            } else {
              if (char === stringChar && currentLine[k - 1] !== '\\') {
                inString = false;
                stringChar = '';
              }
            }
          }
          
          if (foundEnd) break;
        }

        if (foundEnd) {
          // Skip all lines from i to j (inclusive)
          this.stats.byType[`console.${method}`]++;
          removed++;
          i = j + 1;
        } else {
          // Couldn't find end, keep the line
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
   * Check if console statement should be preserved
   */
  shouldPreserveConsoleStatement(statement, method) {
    // Always preserve if inside comments
    if (statement.includes('//') || statement.includes('/*')) {
      const commentIndex = Math.min(
        statement.indexOf('//') !== -1 ? statement.indexOf('//') : Infinity,
        statement.indexOf('/*') !== -1 ? statement.indexOf('/*') : Infinity
      );
      const consoleIndex = statement.indexOf('console.');
      
      if (commentIndex < consoleIndex) {
        return true;
      }
    }

    // Preserve error and warn if option is set
    if (this.options.preserveErrors && (method === 'error' || method === 'warn')) {
      return true;
    }

    // Preserve if it's in a string literal
    if (this.isInStringLiteral(statement)) {
      return true;
    }

    return false;
  }

  /**
   * Check if console statement is inside a string literal
   */
  isInStringLiteral(statement) {
    const consoleIndex = statement.indexOf('console.');
    const beforeConsole = statement.substring(0, consoleIndex);
    
    // Count unescaped quotes before console statement
    const singleQuotes = (beforeConsole.match(/(?<!\\)'/g) || []).length;
    const doubleQuotes = (beforeConsole.match(/(?<!\\)"/g) || []).length;
    const backticks = (beforeConsole.match(/(?<!\\)`/g) || []).length;
    
    return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backticks % 2 === 1);
  }

  /**
   * Print summary of changes
   */
  printSummary() {
    console.log('\n📊 Console.log Removal Summary:');
    console.log('═'.repeat(45));
    console.log(`📁 Files processed: ${this.stats.filesProcessed}`);
    console.log(`✏️  Files modified: ${this.stats.filesModified}`);
    console.log(`🖥️  Console statements removed: ${this.stats.consoleStatementsRemoved}`);
    console.log(`📄 Lines removed: ${this.stats.linesRemoved}`);
    
    console.log('\n📋 Breakdown by console method:');
    for (const [method, count] of Object.entries(this.stats.byType)) {
      if (count > 0) {
        console.log(`  ${method}: ${count} removed`);
      }
    }
    
    if (this.options.dryRun) {
      console.log('\n🔍 This was a dry run - no files were actually modified');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Console.log removal completed successfully!');
    }
    
    console.log('\n💡 Tips:');
    console.log('   • Run your tests after removal to ensure functionality');
    console.log('   • Consider using a proper logging library for production');
    console.log('   • Use --preserve to keep console.error and console.warn');
  }

  /**
   * Show help message
   */
  static showHelp() {
    console.log(`
🧹 Console.log Removal Script for AI E-commerce Platform

This script removes console.log, console.debug, console.info, and other console statements
from TypeScript and JavaScript files while optionally preserving error logging.

Usage:
  node scripts/remove-console-logs.js [options]

Options:
  --dry-run     Show what would be changed without modifying files
  --preserve    Preserve console.error and console.warn statements [default: true]
  --all         Remove ALL console statements including error/warn
  --verbose     Show detailed output for each file processed
  --help        Show this help message

Examples:
  # Dry run to see what would be changed
  node scripts/remove-console-logs.js --dry-run

  # Remove console.log but keep console.error/warn (default)
  node scripts/remove-console-logs.js --preserve

  # Remove ALL console statements
  node scripts/remove-console-logs.js --all

  # Verbose output with dry run
  node scripts/remove-console-logs.js --dry-run --verbose

Console methods handled:
  ✅ console.log()
  ✅ console.debug()
  ✅ console.info()
  ✅ console.warn() (preserved by default)
  ✅ console.error() (preserved by default)
  ✅ console.trace()
  ✅ console.table()
  ✅ console.group() / console.groupEnd()
  ✅ console.time() / console.timeEnd()

Files processed:
  ✅ TypeScript (.ts, .tsx)
  ✅ JavaScript (.js, .jsx)

Preserved statements:
  ✅ Console statements in comments
  ✅ Console statements in string literals
  ✅ console.error and console.warn (unless --all is used)

Excluded directories:
  ❌ node_modules, dist, coverage, .git, .nx, .angular, tmp, build

Safety features:
  🔒 Dry run mode to preview changes
  🔒 Preserves important error logging by default
  🔒 Handles multi-line console statements
  🔒 Skips console statements in strings and comments
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
    preserve: !args.includes('--all'), // Preserve errors unless --all is specified
    all: args.includes('--all'),
    verbose: args.includes('--verbose'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    ConsoleLogRemover.showHelp();
    return;
  }
  
  const remover = new ConsoleLogRemover(options);
  remover.removeConsoleLogsFromCodebase();
}

// Export for testing
module.exports = ConsoleLogRemover;

// Run if called directly
if (require.main === module) {
  main();
}
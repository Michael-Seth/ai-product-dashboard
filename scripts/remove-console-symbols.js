#!/usr/bin/env node

/**
 * Console Symbol/Emoji Removal Script for AI E-commerce Platform
 * 
 * This script removes symbols and emojis from console.log statements while
 * keeping the console statements themselves intact. Useful for cleaning up
 * visual clutter in logs while preserving debugging functionality.
 * 
 * Usage:
 *   node scripts/remove-console-symbols.js [options]
 * 
 * Options:
 *   --dry-run      Show what would be changed without modifying files
 *   --emojis-only  Remove only emojis, keep other symbols
 *   --symbols-only Remove only symbols, keep emojis
 *   --verbose      Show detailed output
 *   --help         Show this help message
 */

const fs = require('fs');
const path = require('path');

class ConsoleSymbolRemover {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      emojisOnly: options.emojisOnly || false,
      symbolsOnly: options.symbolsOnly || false,
      verbose: options.verbose || false,
      ...options
    };
    
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      consoleStatementsModified: 0,
      symbolsRemoved: 0,
      emojisRemoved: 0,
      bySymbolType: {
        emojis: 0,
        arrows: 0,
        shapes: 0,
        technical: 0,
        punctuation: 0,
        other: 0
      }
    };
    this.extensions = ['.ts', '.js', '.tsx', '.jsx'];
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
      'nx.json'
    ];
    this.symbolPatterns = this.buildSymbolPatterns();
  }

  /**
   * Build regex patterns for different types of symbols and emojis
   */
  buildSymbolPatterns() {
    const patterns = {
      emojis: [
        /[\u{1F600}-\u{1F64F}]/gu, // Emoticons
        /[\u{1F300}-\u{1F5FF}]/gu, // Misc Symbols and Pictographs
        /[\u{1F680}-\u{1F6FF}]/gu, // Transport and Map
        /[\u{1F1E0}-\u{1F1FF}]/gu, // Regional indicators (flags)
        /[\u{2600}-\u{26FF}]/gu,   // Misc symbols
        /[\u{2700}-\u{27BF}]/gu,   // Dingbats
        /[\u{1F900}-\u{1F9FF}]/gu, // Supplemental Symbols and Pictographs
        /[\u{1F018}-\u{1F270}]/gu, // Various symbols
      ],
      arrows: [
        /[→←↑↓↔↕⇒⇐⇑⇓⇔⇕➡⬅⬆⬇]/g, // Arrow symbols
        /[▶▷▸▹►▻◀◁◂◃◄◅]/g,           // Triangle arrows
      ],
      
      shapes: [
        /[■□▪▫▬▭▮▯▰▱]/g,              // Squares and rectangles
        /[●○◉◎◯◦◘◙]/g,               // Circles
        /[▲△▴▵▼▽▾▿]/g,               // Triangles
        /[◆◇◈◊]/g,                   // Diamonds
        /[★☆✦✧✩✪✫✬✭✮✯✰]/g,        // Stars
      ],
      
      technical: [
        /[⚡⚙⚠⚡]/g,                  // Technical symbols
        /[🔧🔨🔩⚒⚙]/g,               // Tools (if not caught by emoji)
        /[📊📈📉📋📌📍]/g,            // Charts and pins
        /[🎯🎪🎨🎭🎮]/g,             // Activity symbols
      ],
      
      punctuation: [
        /[•·‣⁃]/g,                   // Bullet points
        /[※‼⁉]/g,                   // Special punctuation
        /[✓✔✗✘]/g,                  // Check marks
        /[⭐⭕❌❎]/g,                 // Status symbols
      ],
      boxDrawing: [
        /[┌┐└┘├┤┬┴┼]/g,              // Box drawing
        /[─│┄┅┆┇┈┉┊┋]/g,            // Lines
        /[╔╗╚╝╠╣╦╩╬]/g,              // Double lines
        /[═║╒╓╕╖╘╙╛╜╞╟╡╢╤╥╧╨╪╫]/g, // Mixed lines
      ]
    };

    return patterns;
  }

  /**
   * Main entry point
   */
  async removeSymbolsFromConsole(rootDir = '.') {
    if (this.options.dryRun) {
    }

    if (this.options.emojisOnly) {
    } else if (this.options.symbolsOnly) {
    } else {
    }
    
    try {
      await this.processDirectory(rootDir);
      this.printSummary();
    } catch (error) {
      console.error(' Error during symbol removal:', error.message);
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
    
    if (this.excludeFiles.includes(fileName) || !this.extensions.includes(fileExt)) {
      return;
    }
    
    this.stats.filesProcessed++;
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const processedContent = this.removeSymbolsFromConsoleStatements(originalContent);
      
      if (originalContent !== processedContent) {
        this.stats.filesModified++;
        
        if (this.options.verbose) {
        }
        
        if (!this.options.dryRun) {
          fs.writeFileSync(filePath, processedContent, 'utf8');
        }
      }
    } catch (error) {
      console.error(` Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Remove symbols and emojis from console statements
   */
  removeSymbolsFromConsoleStatements(content) {
    let result = content;
    let modified = false;
    const consoleRegex = /console\.(log|debug|info|warn|error|trace|table|group|groupEnd|time|timeEnd)\s*\([^)]*\)/g;
    
    result = result.replace(consoleRegex, (match) => {
      const cleanedMatch = this.cleanConsoleStatement(match);
      if (cleanedMatch !== match) {
        modified = true;
        this.stats.consoleStatementsModified++;
      }
      return cleanedMatch;
    });
    result = this.handleMultiLineConsoleStatements(result);

    return result;
  }

  /**
   * Clean symbols and emojis from a single console statement
   */
  cleanConsoleStatement(consoleStatement) {
    let symbolsRemoved = 0;
    let emojisRemoved = 0;
    const match = consoleStatement.match(/console\.\w+\s*\((.*)\)/s);
    if (!match) return consoleStatement;

    const method = consoleStatement.match(/console\.(\w+)/)[1];
    const originalArgs = match[1];
    let cleanedArgs = originalArgs;
    if (!this.options.symbolsOnly) {
      for (const pattern of this.symbolPatterns.emojis) {
        const matches = cleanedArgs.match(pattern);
        if (matches) {
          emojisRemoved += matches.length;
          this.stats.emojisRemoved += matches.length;
          this.stats.bySymbolType.emojis += matches.length;
          cleanedArgs = cleanedArgs.replace(pattern, '');
        }
      }
    }
    if (!this.options.emojisOnly) {
      for (const [category, patterns] of Object.entries(this.symbolPatterns)) {
        if (category === 'emojis') continue; // Already handled above
        
        for (const pattern of patterns) {
          const matches = cleanedArgs.match(pattern);
          if (matches) {
            symbolsRemoved += matches.length;
            this.stats.symbolsRemoved += matches.length;
            this.stats.bySymbolType[category] += matches.length;
            cleanedArgs = cleanedArgs.replace(pattern, '');
          }
        }
      }
    }
    cleanedArgs = this.cleanupArguments(cleanedArgs);
    const cleanedStatement = consoleStatement.replace(
      /console\.\w+\s*\(.*\)/s,
      `console.${method}(${cleanedArgs})`
    );

    if (this.options.verbose && (symbolsRemoved > 0 || emojisRemoved > 0)) {
    }

    return cleanedStatement;
  }

  /**
   * Handle multi-line console statements
   */
  handleMultiLineConsoleStatements(content) {
    const lines = content.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const consoleMatch = line.match(/^\s*console\.\w+\s*\(/);
      
      if (consoleMatch) {
        let completeStatement = line;
        let openParens = this.countOpenParens(line);
        let j = i + 1;

        while (j < lines.length && openParens > 0) {
          completeStatement += '\n' + lines[j];
          openParens += this.countOpenParens(lines[j]);
          j++;
        }
        const cleanedStatement = this.cleanConsoleStatement(completeStatement);
        
        if (cleanedStatement !== completeStatement) {
          this.stats.consoleStatementsModified++;
        }
        const cleanedLines = cleanedStatement.split('\n');
        result.push(...cleanedLines);
        
        i = j;
      } else {
        result.push(line);
        i++;
      }
    }

    return result.join('\n');
  }

  /**
   * Count open parentheses in a line (accounting for strings)
   */
  countOpenParens(line) {
    let count = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : '';

      if (!inString) {
        if (char === '"' || char === "'" || char === '`') {
          inString = true;
          stringChar = char;
        } else if (char === '(') {
          count++;
        } else if (char === ')') {
          count--;
        }
      } else {
        if (char === stringChar && prevChar !== '\\') {
          inString = false;
          stringChar = '';
        }
      }
    }

    return count;
  }

  /**
   * Clean up arguments after symbol removal
   */
  cleanupArguments(args) {
    return args
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      // Remove spaces around commas
      .replace(/\s*,\s*/g, ', ')
      // Remove leading/trailing spaces
      .trim()
      // Remove empty string arguments that might be left
      .replace(/,\s*''\s*,/g, ',')
      .replace(/,\s*""\s*,/g, ',')
      .replace(/,\s*``\s*,/g, ',')
      // Remove leading/trailing empty strings
      .replace(/^''\s*,\s*/, '')
      .replace(/^""\s*,\s*/, '')
      .replace(/^``\s*,\s*/, '')
      .replace(/,\s*''$/, '')
      .replace(/,\s*""$/, '')
      .replace(/,\s*``$/, '')
      // Handle case where only empty strings remain
      .replace(/^''$/, '')
      .replace(/^""$/, '')
      .replace(/^``$/, '');
  }

  /**
   * Print summary of changes
   */
  printSummary() {
    for (const [type, count] of Object.entries(this.stats.bySymbolType)) {
      if (count > 0) {
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
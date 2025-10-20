#!/usr/bin/env node

/**
 * Console Symbol Patch for Existing Console Removal Scripts
 * 
 * This patch modifies the existing console removal scripts to add symbol/emoji
 * removal functionality as an additional option.
 * 
 * Usage:
 *   node scripts/console-symbol-patch.js [options]
 * 
 * Options:
 *   --apply        Apply the patch to existing scripts
 *   --revert       Revert the patch from existing scripts
 *   --dry-run      Show what would be changed without modifying files
 *   --help         Show this help message
 */

const fs = require('fs');
const path = require('path');

class ConsoleSymbolPatch {
  constructor(options = {}) {
    this.options = {
      apply: options.apply || false,
      revert: options.revert || false,
      dryRun: options.dryRun || false,
      ...options
    };
    
    this.patchTargets = [
      'scripts/remove-console-logs.js',
      'scripts/remove-console-logs-advanced.js'
    ];
  }

  /**
   * Main entry point
   */
  async applyPatch() {
    if (this.options.dryRun) {
    }
    
    if (this.options.apply) {
      await this.applySymbolPatch();
    } else if (this.options.revert) {
      await this.revertSymbolPatch();
    } else {
      this.showHelp();
    }
  }

  /**
   * Apply symbol removal patch to existing scripts
   */
  async applySymbolPatch() {
    for (const targetFile of this.patchTargets) {
      await this.patchFile(targetFile);
    }
  }

  /**
   * Revert symbol removal patch from existing scripts
   */
  async revertSymbolPatch() {
    for (const targetFile of this.patchTargets) {
      await this.revertPatchFromFile(targetFile);
    }
  }

  /**
   * Patch individual file
   */
  async patchFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const patchedContent = this.addSymbolRemovalFeature(content);
    
    if (content !== patchedContent) {
      if (!this.options.dryRun) {
        fs.writeFileSync(`${filePath}.backup`, content, 'utf8');
        fs.writeFileSync(filePath, patchedContent, 'utf8');
      }
    } else {
    }
  }

  /**
   * Add symbol removal feature to script content
   */
  addSymbolRemovalFeature(content) {
    if (content.includes('removeSymbolsOnly') || content.includes('SYMBOL_PATCH_APPLIED')) {
      return content;
    }
    
    let patchedContent = content;
    const constructorPatch = `
    // SYMBOL_PATCH_APPLIED - Symbol/Emoji removal feature
    this.symbolRemovalOptions = {
      removeSymbolsOnly: options.removeSymbolsOnly || false,
      removeEmojisOnly: options.removeEmojisOnly || false,
      removeSymbolsAndEmojis: options.removeSymbolsAndEmojis || false
    };
    
    // Symbol patterns for removal
    this.symbolPatterns = {
      emojis: [
        /[\\u{1F600}-\\u{1F64F}]/gu, // Emoticons
        /[\\u{1F300}-\\u{1F5FF}]/gu, // Misc Symbols and Pictographs
        /[\\u{1F680}-\\u{1F6FF}]/gu, // Transport and Map
        /[\\u{1F1E0}-\\u{1F1FF}]/gu, // Regional indicators
        /[\\u{2600}-\\u{26FF}]/gu,   // Misc symbols
        /[\\u{2700}-\\u{27BF}]/gu,   // Dingbats
        /[\\u{1F900}-\\u{1F9FF}]/gu, // Supplemental Symbols
      ],
      symbols: [
        /[→←↑↓↔↕⇒⇐⇑⇓⇔⇕➡⬅⬆⬇]/g, // Arrows
        /[■□▪▫▬▭▮▯▰▱●○◉◎◯◦]/g,     // Shapes
        /[▲△▴▵▼▽▾▿◆◇◈◊]/g,         // Triangles and diamonds
        /[★☆✦✧✩✪✫✬✭✮✯✰]/g,       // Stars
        /[•·‣⁃※‼⁉✓✔✗✘]/g,         // Punctuation
        /[⚡⚙⚠]/g,                   // Technical
        /[┌┐└┘├┤┬┴┼─│]/g,           // Box drawing
      ]
    };`;
    const constructorRegex = /(this\.options = {[\s\S]*?};)/;
    if (constructorRegex.test(patchedContent)) {
      patchedContent = patchedContent.replace(constructorRegex, `$1${constructorPatch}`);
    }
    const symbolRemovalMethod = `
  /**
   * Remove symbols and emojis from console statement content (SYMBOL_PATCH_APPLIED)
   */
  removeSymbolsFromConsoleContent(consoleStatement) {
    if (!this.symbolRemovalOptions.removeSymbolsOnly && 
        !this.symbolRemovalOptions.removeEmojisOnly && 
        !this.symbolRemovalOptions.removeSymbolsAndEmojis) {
      return consoleStatement;
    }
    
    let cleaned = consoleStatement;
    
    // Remove emojis if requested
    if (this.symbolRemovalOptions.removeEmojisOnly || this.symbolRemovalOptions.removeSymbolsAndEmojis) {
      for (const pattern of this.symbolPatterns.emojis) {
        cleaned = cleaned.replace(pattern, '');
      }
    }
    
    // Remove symbols if requested
    if (this.symbolRemovalOptions.removeSymbolsOnly || this.symbolRemovalOptions.removeSymbolsAndEmojis) {
      for (const pattern of this.symbolPatterns.symbols) {
        cleaned = cleaned.replace(pattern, '');
      }
    }
    
    // Clean up extra spaces
    cleaned = cleaned.replace(/\\s+/g, ' ').trim();
    
    return cleaned;
  }`;
    const classEndRegex = /(\n\s*\/\/ Export for testing[\s\S]*?module\.exports)/;
    if (classEndRegex.test(patchedContent)) {
      patchedContent = patchedContent.replace(classEndRegex, `${symbolRemovalMethod}\n$1`);
    }
    const removeConsoleRegex = /(removeConsoleStatements\(content[^}]*{[\s\S]*?)(return result;)/;
    if (removeConsoleRegex.test(patchedContent)) {
      const symbolPatch = `
    // Apply symbol removal if enabled (SYMBOL_PATCH_APPLIED)
    if (this.symbolRemovalOptions.removeSymbolsOnly || 
        this.symbolRemovalOptions.removeEmojisOnly || 
        this.symbolRemovalOptions.removeSymbolsAndEmojis) {
      result = result.replace(/console\\.(\\w+)\\s*\\([^)]*\\)/g, (match) => {
        return this.removeSymbolsFromConsoleContent(match);
      });
    }
    
    `;
      
      patchedContent = patchedContent.replace(removeConsoleRegex, `$1${symbolPatch}$2`);
    }
    const cliOptionsRegex = /(const options = {[\s\S]*?)(help:)/;
    if (cliOptionsRegex.test(patchedContent)) {
      const cliPatch = `    removeSymbolsOnly: args.includes('--remove-symbols-only'),
    removeEmojisOnly: args.includes('--remove-emojis-only'),
    removeSymbolsAndEmojis: args.includes('--remove-symbols-and-emojis'),
    `;
      
      patchedContent = patchedContent.replace(cliOptionsRegex, `$1${cliPatch}$2`);
    }
    const helpRegex = /(Options:[\s\S]*?)(Examples:)/;
    if (helpRegex.test(patchedContent)) {
      const helpPatch = `  --remove-symbols-only     Remove only symbols from console statements
  --remove-emojis-only      Remove only emojis from console statements
  --remove-symbols-and-emojis Remove both symbols and emojis from console statements
  `;
      
      patchedContent = patchedContent.replace(helpRegex, `$1${helpPatch}$2`);
    }
    
    return patchedContent;
  }

  /**
   * Revert patch from file
   */
  async revertPatchFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const backupPath = `${filePath}.backup`;
    if (fs.existsSync(backupPath)) {
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      
      if (!this.options.dryRun) {
        fs.writeFileSync(filePath, backupContent, 'utf8');
        fs.unlinkSync(backupPath); // Remove backup after restore
      }
    } else {
      const revertedContent = this.removePatchMarkers(content);
      
      if (content !== revertedContent) {
        if (!this.options.dryRun) {
          fs.writeFileSync(filePath, revertedContent, 'utf8');
        }
      } else {
      }
    }
  }

  /**
   * Remove patch markers from content
   */
  removePatchMarkers(content) {
    return content
      .replace(/\s*\/\/ SYMBOL_PATCH_APPLIED[\s\S]*?};/g, '')
      .replace(/\s*\/\*\*[\s\S]*?SYMBOL_PATCH_APPLIED[\s\S]*?\n\s*}/g, '')
      .replace(/\s*\/\/ Apply symbol removal[\s\S]*?}\s*\n/g, '')
      .replace(/\s*removeSymbolsOnly:[\s\S]*?,\s*/g, '')
      .replace(/\s*removeEmojisOnly:[\s\S]*?,\s*/g, '')
      .replace(/\s*removeSymbolsAndEmojis:[\s\S]*?,\s*/g, '')
      .replace(/\s*--remove-symbols-only[\s\S]*?\n/g, '')
      .replace(/\s*--remove-emojis-only[\s\S]*?\n/g, '')
      .replace(/\s*--remove-symbols-and-emojis[\s\S]*?\n/g, '');
  }

  /**
   * Show help message
   */
  showHelp() {
  }

  /**
   * Show help message
   */
  static showHelp() {
    const patcher = new ConsoleSymbolPatch();
    patcher.showHelp();
  }
}
function main() {
  const args = process.argv.slice(2);
  
  const options = {
    apply: args.includes('--apply'),
    revert: args.includes('--revert'),
    dryRun: args.includes('--dry-run'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    ConsoleSymbolPatch.showHelp();
    return;
  }
  
  const patcher = new ConsoleSymbolPatch(options);
  patcher.applyPatch();
}
module.exports = ConsoleSymbolPatch;
if (require.main === module) {
  main();
}
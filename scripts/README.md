# 🧹 Comment Removal Scripts

This directory contains scripts for removing comments from the AI-powered e-commerce platform codebase.

## 📋 Available Scripts

### 1. Basic Comment Remover (`remove-comments.js`)

A straightforward script that removes comments from TypeScript, JavaScript, HTML, CSS, and SCSS files.

**Features:**
- ✅ Removes single-line comments (`//`)
- ✅ Removes multi-line comments (`/* */`)
- ✅ Preserves JSDoc comments (`/** */`)
- ✅ Preserves license headers
- ✅ Dry run mode
- ✅ Detailed statistics

**Usage:**
```bash
# Basic usage
npm run remove-comments

# Dry run to preview changes
npm run remove-comments:dry

# Remove all comments including JSDoc
npm run remove-comments:all

# Verbose output
npm run remove-comments:verbose
```

### 2. Advanced Comment Remover (`remove-comments-advanced.js`)

An enhanced version with configuration support and granular control.

**Features:**
- ✅ Configuration file support
- ✅ File pattern matching
- ✅ Custom preserve rules
- ✅ File type specific handling
- ✅ Glob pattern support (optional)
- ✅ Backup creation (configurable)

**Usage:**
```bash
# Advanced removal with config
npm run remove-comments:advanced

# Dry run with advanced features
npm run remove-comments:advanced:dry

# Process only TypeScript files
npm run remove-comments:ts

# Process only JavaScript files
npm run remove-comments:js
```

### 3. Configuration File (`remove-comments.config.js`)

Provides detailed configuration options for the advanced script.

### 4. Console.log Remover (`remove-console-logs.js`)

A focused script that removes console.log and other console statements from your codebase.

**Features:**
- ✅ Removes console.log, console.debug, console.info, etc.
- ✅ Preserves console.error and console.warn by default
- ✅ Handles multi-line console statements
- ✅ Dry run mode for safe testing
- ✅ Detailed statistics by console method

**Usage:**
```bash
# Basic console removal (preserves errors/warnings)
npm run remove-console

# Dry run to preview changes
npm run remove-console:dry

# Remove all console statements
npm run remove-console:all

# Verbose output
npm run remove-console:verbose
```

### 5. Advanced Console.log Remover (`remove-console-logs-advanced.js`)

Enhanced version with environment-specific rules and configuration support.

**Features:**
- ✅ Environment-specific rules (dev, prod, test)
- ✅ File-type specific handling
- ✅ Configuration file support
- ✅ Advanced console statement detection
- ✅ Template literal and object method handling

**Usage:**
```bash
# Production environment (removes most console statements)
npm run remove-console:prod

# Development environment (preserves debug info)
npm run remove-console:dev

# Advanced removal with config
npm run remove-console:advanced

# Advanced dry run
npm run remove-console:advanced:dry
```

### 6. Console Configuration File (`remove-console-logs.config.js`)

Provides detailed configuration options for console statement removal.

### 7. Console Symbol Remover (`remove-console-symbols.js`)

A specialized script that removes only symbols and emojis from console statements while keeping the console statements themselves intact.

**Features:**
- ✅ Removes emojis (😀, 🎯, ⚡, etc.)
- ✅ Removes symbols (→, ●, ★, ✓, etc.)
- ✅ Preserves console statement functionality
- ✅ Handles multi-line console statements
- ✅ Selective removal (emojis-only or symbols-only)

**Usage:**
```bash
# Remove all symbols and emojis from console statements
npm run remove-console-symbols

# Dry run to preview changes
npm run remove-console-symbols:dry

# Remove only emojis (keep symbols)
npm run remove-console-symbols:emojis

# Remove only symbols (keep emojis)
npm run remove-console-symbols:symbols
```

### 8. Console Symbol Patch (`console-symbol-patch.js`)

A patch tool that adds symbol/emoji removal functionality to existing console removal scripts.

**Features:**
- ✅ Patches existing console removal scripts
- ✅ Adds symbol removal options to existing tools
- ✅ Creates automatic backups
- ✅ Reversible patching

**Usage:**
```bash
# Apply the patch to existing scripts
npm run patch-console-symbols

# Revert the patch
npm run patch-console-symbols:revert
```

### 9. Documentation Organizer (`organize-docs.js`)

A utility script that organizes all .md files into a structured docs folder for better codebase organization.

**Features:**
- ✅ Creates organized docs folder structure
- ✅ Moves all documentation files appropriately
- ✅ Updates file references automatically
- ✅ Creates comprehensive documentation index
- ✅ Reversible organization

**Usage:**
```bash
# Organize documentation into docs folder
npm run organize-docs

# Preview organization changes
npm run organize-docs:dry

# Revert organization (move files back to root)
npm run organize-docs:revert
```

## 🚀 Quick Start

### Preview Changes (Recommended First Step)
```bash
# See what would be changed without modifying files
npm run remove-comments:dry
```

### Remove Comments from Entire Codebase
```bash
# Basic removal (preserves JSDoc and licenses)
npm run remove-comments

# Or use advanced version
npm run remove-comments:advanced
```

### Target Specific File Types
```bash
# Only TypeScript files
npm run remove-comments:ts

# Only JavaScript files  
npm run remove-comments:js

# Custom pattern (requires advanced script)
node scripts/remove-comments-advanced.js --pattern "**/*.component.ts"
```

### Remove Console Statements
```bash
# Preview console removal
npm run remove-console:dry

# Remove console.log but keep errors/warnings
npm run remove-console

# Remove all console statements
npm run remove-console:all

# Environment-specific removal
npm run remove-console:prod  # Production build
npm run remove-console:dev   # Development cleanup
```

### Remove Only Symbols/Emojis from Console Statements
```bash
# Preview symbol/emoji removal
npm run remove-console-symbols:dry

# Remove all symbols and emojis (keep console statements)
npm run remove-console-symbols

# Remove only emojis
npm run remove-console-symbols:emojis

# Remove only symbols
npm run remove-console-symbols:symbols
```

### Organize Documentation
```bash
# Move all .md files to organized docs folder
npm run organize-docs

# Preview documentation organization
npm run organize-docs:dry

# Revert organization (move files back to root)
npm run organize-docs:revert
```

## 📖 Detailed Usage

### Console Removal Script Options

```bash
node scripts/remove-console-logs.js [options]

Options:
  --dry-run     Show what would be changed without modifying files
  --preserve    Preserve console.error and console.warn statements [default: true]
  --all         Remove ALL console statements including error/warn
  --verbose     Show detailed output
  --help        Show help message
```

### Advanced Console Removal Options

```bash
node scripts/remove-console-logs-advanced.js [options] [paths...]

Options:
  --config <path>       Use custom configuration file
  --dry-run             Show what would be changed without modifying files
  --env <environment>   Target environment (development, production, test)
  --preserve-errors     Preserve console.error and console.warn
  --remove-all          Remove all console statements
  --verbose             Show detailed output
  --pattern <regex>     Process only files matching pattern
  --help                Show help message
```

### Basic Script Options

```bash
node scripts/remove-comments.js [options]

Options:
  --dry-run     Show what would be changed without modifying files
  --preserve    Preserve JSDoc comments (default: true)
  --no-preserve Don't preserve JSDoc comments
  --verbose     Show detailed output
  --help        Show help message
```

### Advanced Script Options

```bash
node scripts/remove-comments-advanced.js [options] [paths...]

Options:
  --config <path>   Use custom configuration file
  --dry-run         Show what would be changed without modifying files
  --verbose         Show detailed output
  --pattern <glob>  Process only files matching pattern
  --exclude <glob>  Exclude files matching pattern
  --help            Show help message
```

## ⚙️ Configuration

### Default Behavior

Both scripts preserve:
- ✅ JSDoc comments (`/** ... */`)
- ✅ License headers
- ✅ Copyright notices
- ✅ Angular-specific HTML comments
- ✅ ESLint/Prettier directives
- ✅ Conditional comments

### Custom Configuration

Create a custom config file based on `remove-comments.config.js`:

```javascript
module.exports = {
  extensions: ['.ts', '.js', '.html', '.css', '.scss'],
  excludeDirs: ['node_modules', 'dist', 'coverage'],
  preservePatterns: {
    js: [
      /\/\*\*[\s\S]*?\*\//g,  // JSDoc comments
      /\/\/\s*TODO:/g,        // TODO comments
    ]
  },
  customRules: {
    '.ts': {
      preserveJSDoc: true,
      preserveTodos: false
    }
  }
};
```

## 📊 Output Examples

### Basic Script Output
```
🧹 Starting comment removal process...

📊 Comment Removal Summary:
════════════════════════════════════════
📁 Files processed: 45
✏️  Files modified: 23
💬 Comments removed: 156
📄 Lines removed: 89

✅ Comment removal completed successfully!
```

### Advanced Script Output
```
🧹 Starting advanced comment removal process...

📊 Advanced Comment Removal Summary:
══════════════════════════════════════════════════
📁 Files processed: 45
✏️  Files modified: 23
💬 Comments removed: 156
📄 Lines removed: 89

📋 Breakdown by file type:
  .ts: 25 processed, 15 modified, 89 comments removed
  .js: 8 processed, 4 modified, 23 comments removed
  .html: 7 processed, 2 modified, 12 comments removed
  .css: 5 processed, 2 modified, 32 comments removed

✅ Advanced comment removal completed successfully!
```

## 🛡️ Safety Features

### Dry Run Mode
Always test with `--dry-run` first to see what would be changed:

```bash
npm run remove-comments:dry
```

### Backup Creation
The advanced script can create backups (configure in config file):

```javascript
module.exports = {
  output: {
    createBackups: true  // Creates .backup files
  }
};
```

### Preserve Important Comments
Both scripts automatically preserve:
- License headers and copyright notices
- JSDoc documentation comments
- Framework-specific comments (Angular, ESLint, etc.)
- Conditional comments in HTML

## 🎯 Use Cases

### 1. Production Build Preparation
Remove development comments before production deployment:

```bash
# Preview changes
npm run remove-comments:dry

# Apply changes
npm run remove-comments

# Build for production
npm run build:prod
```

### 2. Code Cleanup
Clean up old commented code and debug comments:

```bash
# Remove all comments including JSDoc
npm run remove-comments:all
```

### 3. Specific File Processing
Target specific file types or directories:

```bash
# Only component files
node scripts/remove-comments-advanced.js --pattern "**/*.component.ts"

# Specific directory
node scripts/remove-comments-advanced.js src/app/components

# Exclude test files
node scripts/remove-comments-advanced.js --exclude "**/*.spec.ts"
```

## 🔧 Troubleshooting

### Common Issues

**Script not found:**
```bash
# Make sure you're in the project root
cd ai-product-dashboard
npm run remove-comments:dry
```

**Permission errors:**
```bash
# Make script executable (Unix/Linux/Mac)
chmod +x scripts/remove-comments.js
```

**Glob patterns not working:**
```bash
# Install glob dependency for advanced features
npm install glob --save-dev
```

### Verification

After running the script:

1. **Check git diff** to review changes:
   ```bash
   git diff
   ```

2. **Run tests** to ensure functionality:
   ```bash
   npm test
   ```

3. **Run linter** to fix formatting:
   ```bash
   npm run lint
   ```

4. **Build project** to verify no errors:
   ```bash
   npm run build:all
   ```

## 📝 Best Practices

### Before Running
1. ✅ Commit your current changes
2. ✅ Run tests to ensure everything works
3. ✅ Use dry run mode first
4. ✅ Review the changes that would be made

### After Running
1. ✅ Review git diff carefully
2. ✅ Run tests again
3. ✅ Run linter/formatter
4. ✅ Build project to check for errors
5. ✅ Commit changes with descriptive message

### Recommended Workflow
```bash
# 1. Commit current work
git add .
git commit -m "Save work before comment removal"

# 2. Preview changes
npm run remove-comments:dry

# 3. Apply changes
npm run remove-comments

# 4. Review and test
git diff
npm test
npm run lint
npm run build:all

# 5. Commit changes
git add .
git commit -m "Remove development comments for production"
```

## 🤝 Contributing

To improve these scripts:

1. **Test thoroughly** with different file types
2. **Add new preserve patterns** for important comments
3. **Improve error handling** for edge cases
4. **Add new configuration options** as needed
5. **Update documentation** for new features

## 📄 License

These scripts are part of the AI-powered e-commerce platform and follow the same MIT license.
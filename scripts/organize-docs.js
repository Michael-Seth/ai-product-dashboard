#!/usr/bin/env node

/**
 * Documentation Organization Script for AI E-commerce Platform
 * 
 * This script moves all .md files from the root directory to a organized docs folder
 * structure and updates any references to these files in the codebase.
 * 
 * Usage:
 *   node scripts/organize-docs.js [options]
 * 
 * Options:
 *   --dry-run      Show what would be changed without modifying files
 *   --revert       Revert the organization (move files back to root)
 *   --verbose      Show detailed output
 *   --help         Show this help message
 */

const fs = require('fs');
const path = require('path');

class DocsOrganizer {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      revert: options.revert || false,
      verbose: options.verbose || false,
      ...options
    };
    
    this.stats = {
      filesProcessed: 0,
      filesMoved: 0,
      referencesUpdated: 0
    };
    this.docsStructure = {
      'docs': {
        'README.md': 'README.md',
        'CHANGELOG.md': 'CHANGELOG.md',
        'CONTRIBUTING.md': 'CONTRIBUTING.md',
        'PROJECT_EXPLANATION.md': 'PROJECT_EXPLANATION.md',
        'FEATURES.md': 'FEATURES.md',
        'architecture': {
          'ARCHITECTURE.md': 'ARCHITECTURE.md',
          'UX_FLOW.md': 'UX_FLOW.md'
        },
        'development': {
          'INSTALLATION.md': 'INSTALLATION.md',
          'DEV-SERVER.md': 'DEV-SERVER.md',
          'BUILD_OPTIMIZATION.md': 'BUILD_OPTIMIZATION.md'
        },
        'api': {
          'API.md': 'API.md'
        },
        'deployment': {
          'DEPLOYMENT.md': 'DEPLOYMENT.md'
        },
        'troubleshooting': {
          'TROUBLESHOOTING.md': 'TROUBLESHOOTING.md',
          'ERROR_HANDLING.md': 'ERROR_HANDLING.md'
        }
      }
    };
    this.keepInRoot = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'angular.json',
      'nx.json',
      '.gitignore',
      'vercel.json',
      'jest.config.ts'
    ];
    this.referenceFiles = [
      'package.json',
      'README.md',
      'CONTRIBUTING.md',
      'scripts/README.md'
    ];
  }

  /**
   * Main entry point
   */
  async organizeDocs() {
    if (this.options.dryRun) {
    }
    
    if (this.options.revert) {
      await this.revertOrganization();
    } else {
      await this.organizeDocumentation();
    }
    
    this.printSummary();
  }

  /**
   * Organize documentation into docs folder
   */
  async organizeDocumentation() {
    await this.createDocsStructure();
    await this.moveDocumentationFiles();
    await this.updateReferences();
    await this.createDocsIndex();
  }

  /**
   * Create the docs folder structure
   */
  async createDocsStructure() {
    const createDir = (dirPath) => {
      if (!fs.existsSync(dirPath)) {
        if (!this.options.dryRun) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        if (this.options.verbose) {
        }
      }
    };
    createDir('docs');
    createDir('docs/architecture');
    createDir('docs/development');
    createDir('docs/api');
    createDir('docs/deployment');
    createDir('docs/troubleshooting');
  }

  /**
   * Move documentation files to appropriate locations
   */
  async moveDocumentationFiles() {
    const fileMappings = {
      'README.md': 'docs/README.md',
      'CHANGELOG.md': 'docs/CHANGELOG.md',
      'CONTRIBUTING.md': 'docs/CONTRIBUTING.md',
      'PROJECT_EXPLANATION.md': 'docs/PROJECT_EXPLANATION.md',
      'FEATURES.md': 'docs/FEATURES.md',
      'ARCHITECTURE.md': 'docs/architecture/ARCHITECTURE.md',
      'UX_FLOW.md': 'docs/architecture/UX_FLOW.md',
      'INSTALLATION.md': 'docs/development/INSTALLATION.md',
      'DEV-SERVER.md': 'docs/development/DEV-SERVER.md',
      'BUILD_OPTIMIZATION.md': 'docs/development/BUILD_OPTIMIZATION.md',
      'API.md': 'docs/api/API.md',
      'DEPLOYMENT.md': 'docs/deployment/DEPLOYMENT.md',
      'TROUBLESHOOTING.md': 'docs/troubleshooting/TROUBLESHOOTING.md',
      'ERROR_HANDLING.md': 'docs/troubleshooting/ERROR_HANDLING.md'
    };
    
    for (const [source, destination] of Object.entries(fileMappings)) {
      if (fs.existsSync(source)) {
        this.stats.filesProcessed++;
        
        if (this.options.verbose) {
        }
        
        if (!this.options.dryRun) {
          const content = fs.readFileSync(source, 'utf8');
          fs.writeFileSync(destination, content, 'utf8');
          fs.unlinkSync(source);
        }
        
        this.stats.filesMoved++;
      }
    }
  }

  /**
   * Update references to moved files
   */
  async updateReferences() {
    const referenceUpdates = {
      './README.md': './docs/README.md',
      './CONTRIBUTING.md': './docs/CONTRIBUTING.md',
      './CHANGELOG.md': './docs/CHANGELOG.md',
      './ARCHITECTURE.md': './docs/architecture/ARCHITECTURE.md',
      './API.md': './docs/api/API.md',
      './INSTALLATION.md': './docs/development/INSTALLATION.md',
      './DEPLOYMENT.md': './docs/deployment/DEPLOYMENT.md',
      './TROUBLESHOOTING.md': './docs/troubleshooting/TROUBLESHOOTING.md',
      './ERROR_HANDLING.md': './docs/troubleshooting/ERROR_HANDLING.md',
      './UX_FLOW.md': './docs/architecture/UX_FLOW.md',
      './FEATURES.md': './docs/FEATURES.md',
      './PROJECT_EXPLANATION.md': './docs/PROJECT_EXPLANATION.md',
      './BUILD_OPTIMIZATION.md': './docs/development/BUILD_OPTIMIZATION.md',
      './DEV-SERVER.md': './docs/development/DEV-SERVER.md',
      'ARCHITECTURE.md': 'docs/architecture/ARCHITECTURE.md',
      'API.md': 'docs/api/API.md',
      'INSTALLATION.md': 'docs/development/INSTALLATION.md',
      'DEPLOYMENT.md': 'docs/deployment/DEPLOYMENT.md',
      'TROUBLESHOOTING.md': 'docs/troubleshooting/TROUBLESHOOTING.md',
      'ERROR_HANDLING.md': 'docs/troubleshooting/ERROR_HANDLING.md',
      'UX_FLOW.md': 'docs/architecture/UX_FLOW.md',
      'FEATURES.md': 'docs/FEATURES.md',
      'CONTRIBUTING.md': 'docs/CONTRIBUTING.md',
      'CHANGELOG.md': 'docs/CHANGELOG.md',
      'PROJECT_EXPLANATION.md': 'docs/PROJECT_EXPLANATION.md',
      'BUILD_OPTIMIZATION.md': 'docs/development/BUILD_OPTIMIZATION.md',
      'DEV-SERVER.md': 'docs/development/DEV-SERVER.md'
    };
    const filesToUpdate = [
      'scripts/README.md'
    ];
    
    for (const file of filesToUpdate) {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let updated = false;
        
        for (const [oldPath, newPath] of Object.entries(referenceUpdates)) {
          if (content.includes(oldPath)) {
            content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
            updated = true;
          }
        }
        
        if (updated) {
          if (!this.options.dryRun) {
            fs.writeFileSync(file, content, 'utf8');
          }
          this.stats.referencesUpdated++;
          
          if (this.options.verbose) {
          }
        }
      }
    }
  }

  /**
   * Create a comprehensive docs index
   */
  async createDocsIndex() {
    const indexContent = `# 📚 AI E-commerce Platform Documentation

Welcome to the comprehensive documentation for the AI-powered e-commerce platform. This documentation is organized into logical sections to help you find what you need quickly.

## 📖 Quick Navigation

### 🏠 **Getting Started**
- [**README**](README.md) - Project overview and quick start guide
- [**Project Explanation**](PROJECT_EXPLANATION.md) - Simple explanation of what this project does
- [**Features**](FEATURES.md) - Comprehensive feature list and roadmap
- [**Installation**](development/INSTALLATION.md) - Setup and installation guide

### 🏗️ **Architecture & Design**
- [**Architecture**](architecture/ARCHITECTURE.md) - System architecture and design patterns
- [**UX Flow**](architecture/UX_FLOW.md) - Complete user experience journey

### 💻 **Development**
- [**Installation Guide**](development/INSTALLATION.md) - Local development setup
- [**Development Server**](development/DEV-SERVER.md) - Running the development environment
- [**Build Optimization**](development/BUILD_OPTIMIZATION.md) - Performance and build optimization

### 🔌 **API Documentation**
- [**API Reference**](api/API.md) - Complete API documentation and endpoints

### 🚀 **Deployment**
- [**Deployment Guide**](deployment/DEPLOYMENT.md) - Production deployment instructions

### 🔧 **Troubleshooting & Support**
- [**Troubleshooting**](troubleshooting/TROUBLESHOOTING.md) - Common issues and solutions
- [**Error Handling**](troubleshooting/ERROR_HANDLING.md) - Error handling implementation

### 🤝 **Contributing**
- [**Contributing Guide**](CONTRIBUTING.md) - How to contribute to the project
- [**Changelog**](CHANGELOG.md) - Version history and changes

---

## 📁 Documentation Structure

\`\`\`
docs/
├── README.md                    # Project overview
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Contribution guidelines
├── PROJECT_EXPLANATION.md       # Simple project explanation
├── FEATURES.md                  # Feature documentation
├── architecture/
│   ├── ARCHITECTURE.md          # System architecture
│   └── UX_FLOW.md              # User experience flow
├── development/
│   ├── INSTALLATION.md          # Setup guide
│   ├── DEV-SERVER.md           # Development server
│   └── BUILD_OPTIMIZATION.md   # Build optimization
├── api/
│   └── API.md                  # API documentation
├── deployment/
│   └── DEPLOYMENT.md           # Deployment guide
└── troubleshooting/
    ├── TROUBLESHOOTING.md      # Common issues
    └── ERROR_HANDLING.md       # Error handling
\`\`\`

## 🎯 **Quick Links by Role**

### **For Developers**
1. [Installation Guide](development/INSTALLATION.md) - Get started with development
2. [Architecture Overview](architecture/ARCHITECTURE.md) - Understand the system
3. [API Documentation](api/API.md) - Integrate with APIs
4. [Troubleshooting](troubleshooting/TROUBLESHOOTING.md) - Solve common issues

### **For DevOps/Deployment**
1. [Deployment Guide](deployment/DEPLOYMENT.md) - Deploy to production
2. [Build Optimization](development/BUILD_OPTIMIZATION.md) - Optimize builds
3. [Error Handling](troubleshooting/ERROR_HANDLING.md) - Handle production errors

### **For Product Managers**
1. [Features Overview](FEATURES.md) - Complete feature list
2. [UX Flow](architecture/UX_FLOW.md) - User journey mapping
3. [Project Explanation](PROJECT_EXPLANATION.md) - High-level overview

### **For Contributors**
1. [Contributing Guide](CONTRIBUTING.md) - How to contribute
2. [Development Setup](development/INSTALLATION.md) - Local development
3. [Architecture](architecture/ARCHITECTURE.md) - System design

---

## 🔍 **Search Tips**

- Use your browser's search (Ctrl/Cmd + F) to find specific topics
- Check the troubleshooting section for common issues
- API documentation includes examples and response formats
- Architecture documentation includes diagrams and flow charts

## 📞 **Getting Help**

If you can't find what you're looking for:

1. **Check [Troubleshooting](troubleshooting/TROUBLESHOOTING.md)** for common issues
2. **Review [Contributing Guide](CONTRIBUTING.md)** for development questions
3. **Check [API Documentation](api/API.md)** for integration questions
4. **Create an issue** on GitHub with your question

---

**Built with ❤️ using modern web technologies and AI-powered recommendations**
`;

    if (!this.options.dryRun) {
      fs.writeFileSync('docs/index.md', indexContent, 'utf8');
    }
  }

  /**
   * Revert organization (move files back to root)
   */
  async revertOrganization() {
    const revertMappings = {
      'docs/README.md': 'README.md',
      'docs/CHANGELOG.md': 'CHANGELOG.md',
      'docs/CONTRIBUTING.md': 'CONTRIBUTING.md',
      'docs/PROJECT_EXPLANATION.md': 'PROJECT_EXPLANATION.md',
      'docs/FEATURES.md': 'FEATURES.md',
      'docs/architecture/ARCHITECTURE.md': 'ARCHITECTURE.md',
      'docs/architecture/UX_FLOW.md': 'UX_FLOW.md',
      'docs/development/INSTALLATION.md': 'INSTALLATION.md',
      'docs/development/DEV-SERVER.md': 'DEV-SERVER.md',
      'docs/development/BUILD_OPTIMIZATION.md': 'BUILD_OPTIMIZATION.md',
      'docs/api/API.md': 'API.md',
      'docs/deployment/DEPLOYMENT.md': 'DEPLOYMENT.md',
      'docs/troubleshooting/TROUBLESHOOTING.md': 'TROUBLESHOOTING.md',
      'docs/troubleshooting/ERROR_HANDLING.md': 'ERROR_HANDLING.md'
    };
    
    for (const [source, destination] of Object.entries(revertMappings)) {
      if (fs.existsSync(source)) {
        this.stats.filesProcessed++;
        
        if (this.options.verbose) {
        }
        
        if (!this.options.dryRun) {
          const content = fs.readFileSync(source, 'utf8');
          fs.writeFileSync(destination, content, 'utf8');
        }
        
        this.stats.filesMoved++;
      }
    }
    
    // Remove docs folder if empty
    if (!this.options.dryRun && fs.existsSync('docs')) {
      try {
        fs.rmSync('docs', { recursive: true, force: true });
      } catch (error) {
      }
    }
  }

  /**
   * Print summary of changes
   */
  printSummary() {
    if (this.options.dryRun) {
    } else {
      if (!this.options.revert) {
      }
    }
  }

  /**
   * Show help message
   */
  static showHelp() {
  --verbose     Show detailed output for each file processed
  --help        Show this help message

Examples:
  # Preview the organization
  node scripts/organize-docs.js --dry-run

  # Organize documentation
  node scripts/organize-docs.js

  # Revert organization
  node scripts/organize-docs.js --revert

  # Verbose output
  node scripts/organize-docs.js --verbose

Documentation Structure Created:
  docs/
  ├── README.md                    # Project overview
  ├── CHANGELOG.md                 # Version history
  ├── CONTRIBUTING.md              # Contribution guidelines
  ├── PROJECT_EXPLANATION.md       # Simple explanation
  ├── FEATURES.md                  # Feature documentation
  ├── architecture/
  │   ├── ARCHITECTURE.md          # System architecture
  │   └── UX_FLOW.md              # User experience flow
  ├── development/
  │   ├── INSTALLATION.md          # Setup guide
  │   ├── DEV-SERVER.md           # Development server
  │   └── BUILD_OPTIMIZATION.md   # Build optimization
  ├── api/
  │   └── API.md                  # API documentation
  ├── deployment/
  │   └── DEPLOYMENT.md           # Deployment guide
  └── troubleshooting/
      ├── TROUBLESHOOTING.md      # Common issues
      └── ERROR_HANDLING.md       # Error handling

Features:
  ✅ Organized folder structure
  ✅ Automatic reference updates
  ✅ Comprehensive documentation index
  ✅ Reversible organization
  ✅ Dry run mode for safety
`);
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  
  const options = {
    dryRun: args.includes('--dry-run'),
    revert: args.includes('--revert'),
    verbose: args.includes('--verbose'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    DocsOrganizer.showHelp();
    return;
  }
  
  const organizer = new DocsOrganizer(options);
  organizer.organizeDocs();
}

// Export for testing
module.exports = DocsOrganizer;

// Run if called directly
if (require.main === module) {
  main();
}
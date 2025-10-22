#!/usr/bin/env node

/**
 * Copy Web Component Script for AI E-commerce Platform
 * 
 * This script copies the built React web component files to the Angular public directory
 * so they can be served by the Angular development server.
 * 
 * Usage:
 *   node scripts/copy-web-component.js
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'dist/react-recommender-web-component';
const TARGET_DIR = 'angular-dashboard/public';

const FILES_TO_COPY = [
  'react-recommender.css',
  'react-recommender.js'
];

function copyWebComponentFiles() {
  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    console.error('   Please build the web component first:');
    console.error('   npm run build:react-web-component\n');
    process.exit(1);
  }

  // Ensure target directory exists
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  let copiedFiles = 0;
  let errors = 0;

  // Copy each file
  FILES_TO_COPY.forEach(fileName => {
    const sourcePath = path.join(SOURCE_DIR, fileName);
    const targetPath = path.join(TARGET_DIR, fileName);

    try {
      if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Source file not found: ${sourcePath}`);
        errors++;
        return;
      }

      fs.copyFileSync(sourcePath, targetPath);
      copiedFiles++;
    } catch (error) {
      console.error(`❌ Failed to copy ${fileName}:`, error.message);
      errors++;
    }
  });
  if (errors > 0) {
    process.exit(1);
  } else {
  }
}

// Run if called directly
if (require.main === module) {
  copyWebComponentFiles();
}

module.exports = { copyWebComponentFiles };
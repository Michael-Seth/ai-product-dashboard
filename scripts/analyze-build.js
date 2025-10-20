#!/usr/bin/env node

/**
 * Build Analysis Script
 * 
 * Analyzes the production build outputs and provides
 * bundle size information and optimization recommendations.
 */

const fs = require('fs');
const path = require('path');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDirectory(dirPath, appName) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  const files = [];
  
  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else {
        const relativePath = path.relative(dirPath, fullPath);
        files.push({
          path: relativePath,
          size: stat.size,
          ext: path.extname(item)
        });
      }
    }
  }

  walkDir(dirPath);
  files.sort((a, b) => b.size - a.size);
  const byType = {};
  let totalSize = 0;

  files.forEach(file => {
    totalSize += file.size;
    const type = file.ext || 'no-ext';
    if (!byType[type]) byType[type] = [];
    byType[type].push(file);
  });
  Object.keys(byType).sort().forEach(type => {
    const typeFiles = byType[type];
    const typeSize = typeFiles.reduce((sum, f) => sum + f.size, 0);
    const percentage = ((typeSize / totalSize) * 100).toFixed(1);
  });
  files.slice(0, 10).forEach((file, index) => {
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
  });
  const jsFiles = files.filter(f => f.ext === '.js');
  const cssFiles = files.filter(f => f.ext === '.css');
  const largeFiles = files.filter(f => f.size > 100 * 1024); // > 100KB

  if (jsFiles.length > 0) {
    const jsSize = jsFiles.reduce((sum, f) => sum + f.size, 0);
    if (jsSize > 500 * 1024) {
    }
  }

  if (cssFiles.length > 0) {
    const cssSize = cssFiles.reduce((sum, f) => sum + f.size, 0);
    if (cssSize > 50 * 1024) {
    }
  }

  if (largeFiles.length > 0) {
  }

  return {
    totalSize,
    fileCount: files.length,
    jsSize: jsFiles.reduce((sum, f) => sum + f.size, 0),
    cssSize: cssFiles.reduce((sum, f) => sum + f.size, 0)
  };
}

function main() {
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    process.exit(1);
  }

  const apps = [
    { name: 'Angular Dashboard', path: path.join(distPath, 'angular-dashboard') },
    { name: 'React Recommender', path: path.join(distPath, 'react-recommender') },
    { name: 'React Web Component', path: path.join(distPath, 'react-recommender-web-component') }
  ];

  const results = {};
  
  apps.forEach(app => {
    results[app.name] = analyzeDirectory(app.path, app.name);
  });
  let totalOverallSize = 0;
  let totalOverallFiles = 0;
  
  Object.keys(results).forEach(appName => {
    const result = results[appName];
    if (result) {
      totalOverallSize += result.totalSize;
      totalOverallFiles += result.fileCount;
    }
  });
  if (totalOverallSize > 2 * 1024 * 1024) { // > 2MB
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeDirectory, formatBytes };
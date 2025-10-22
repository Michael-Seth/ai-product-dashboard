#!/usr/bin/env node

/**
 * Production Deployment Script
 * 
 * Handles the complete production build and deployment process
 * with optimization verification and bundle analysis.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '',
    build: '🔨'
  }[type] || '📋';
}

function runCommand(command, description) {
  log(`${description}...`, 'build');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`${description} completed successfully`, 'success');
  } catch (error) {
    log(`${description} failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

function checkEnvironment() {
  log('Checking environment...', 'info');

  if (!fs.existsSync('package.json')) {
    log('package.json not found. Please run from project root.', 'error');
    process.exit(1);
  }

  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`, 'info');

  if (!fs.existsSync('node_modules')) {
    log('node_modules not found. Installing dependencies...', 'warning');
    runCommand('npm install', 'Installing dependencies');
  }
  
  log('Environment check passed', 'success');
}

function cleanBuildDirectory() {
  log('Cleaning build directory...', 'info');
  
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    log('Previous build cleaned', 'success');
  }
}

function runTests() {
  log('Running tests before build...', 'info');
  
  try {
    execSync('npm run test:all', { stdio: 'inherit' });
    log('All tests passed', 'success');
  } catch (error) {
    log('Tests failed. Deployment aborted.', 'error');
    process.exit(1);
  }
}

function buildApplications() {
  log('Building applications for production...', 'build');

  runCommand('npx nx build shared-types', 'Building shared types');
  runCommand('npx nx build shared-api', 'Building shared API');

  runCommand('npx nx build angular-dashboard --configuration=production', 'Building Angular dashboard');
  runCommand('npx nx build react-recommender --configuration=production', 'Building React recommender');

  runCommand('npx nx build-web-component react-recommender --configuration=production', 'Building React web component');
  
  log('All builds completed successfully', 'success');
}

function analyzeBundles() {
  log('Analyzing bundle sizes...', 'info');
  
  try {
    execSync('node scripts/analyze-build.js', { stdio: 'inherit' });
    log('Bundle analysis completed', 'success');
  } catch (error) {
    log('Bundle analysis failed, but continuing...', 'warning');
  }
}

function verifyBuild() {
  log('Verifying build outputs...', 'info');
  
  const requiredPaths = [
    'dist/angular-dashboard',
    'dist/react-recommender',
    'dist/react-recommender-web-component',
    'dist/shared-types',
    'dist/shared-api'
  ];
  
  const missing = requiredPaths.filter(p => !fs.existsSync(p));
  
  if (missing.length > 0) {
    log(`Missing build outputs: ${missing.join(', ')}`, 'error');
    process.exit(1);
  }
  
  log('Build verification passed', 'success');
}

function generateDeploymentReport() {
  log('Generating deployment report...', 'info');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    buildOutputs: [],
    recommendations: []
  };

  const outputs = [
    { name: 'Angular Dashboard', path: 'dist/angular-dashboard' },
    { name: 'React Recommender', path: 'dist/react-recommender' },
    { name: 'React Web Component', path: 'dist/react-recommender-web-component' }
  ];
  
  outputs.forEach(output => {
    if (fs.existsSync(output.path)) {
      const stats = fs.statSync(output.path);
      report.buildOutputs.push({
        name: output.name,
        path: output.path,
        exists: true,
        size: getDirSize(output.path)
      });
    }
  });

  report.recommendations = [
    'Enable gzip/brotli compression on your server',
    'Configure proper cache headers for static assets',
    'Use a CDN for global asset delivery',
    'Monitor bundle sizes in CI/CD pipeline',
    'Consider implementing service worker for offline support'
  ];
  
  fs.writeFileSync('deployment-report.json', JSON.stringify(report, null, 2));
  log('Deployment report saved to deployment-report.json', 'success');
}

function getDirSize(dirPath) {
  let totalSize = 0;
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else {
        totalSize += stat.size;
      }
    }
  }
  
  walkDir(dirPath);
  return totalSize;
}

function main() {
  const startTime = Date.now();
  
  try {
    checkEnvironment();
    cleanBuildDirectory();
    runTests();
    buildApplications();
    verifyBuild();
    analyzeBundles();
    generateDeploymentReport();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log(`Deployment preparation completed in ${duration}s`, 'success');
    log('Ready for deployment to Vercel or other platforms', 'success');
  } catch (error) {
    log(`Deployment preparation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
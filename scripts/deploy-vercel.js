#!/usr/bin/env node

/**
 * Vercel Deployment Script for AI E-commerce Platform
 * 
 * This script prepares and deploys the application to Vercel
 * 
 * Usage:
 *   node scripts/deploy-vercel.js [--preview]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isPreview = process.argv.includes('--preview');

function runCommand(command, description) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(` ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (error) {
    console.error(' Vercel CLI not found. Please install it:');
    console.error('   npm install -g vercel');
    process.exit(1);
  }
}

function validateEnvironment() {
  const requiredFiles = [
    'vercel.json',
    'package.json',
    'api/recommendations.js',
    'api/health.js'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(` Required file missing: ${file}`);
      process.exit(1);
    }
  }
}

function deployToVercel() {
  checkVercelCLI();
  validateEnvironment();

  runCommand('npm run build:prod', 'Building application');

  const deployCommand = isPreview ? 'vercel' : 'vercel --prod';
  runCommand(deployCommand, `Deploying to Vercel ${isPreview ? '(preview)' : '(production)'}`);
}

if (require.main === module) {
  deployToVercel();
}

module.exports = { deployToVercel };
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
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed');
  } catch (error) {
    console.error('❌ Vercel CLI not found. Please install it:');
    console.error('   npm install -g vercel');
    process.exit(1);
  }
}

function validateEnvironment() {
  console.log('\n🔍 Validating environment...');
  
  const requiredFiles = [
    'vercel.json',
    'package.json',
    'api/recommendations.js',
    'api/health.js'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Required file missing: ${file}`);
      process.exit(1);
    }
  }

  console.log('✅ All required files present');
}

function deployToVercel() {
  console.log('\n🚀 Starting Vercel deployment...\n');
  
  checkVercelCLI();
  validateEnvironment();
  
  // Build the application
  runCommand('npm run build:prod', 'Building application');
  
  // Deploy to Vercel
  const deployCommand = isPreview ? 'vercel' : 'vercel --prod';
  runCommand(deployCommand, `Deploying to Vercel ${isPreview ? '(preview)' : '(production)'}`);
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Set up environment variables in Vercel dashboard');
  console.log('   2. Configure custom domain (if needed)');
  console.log('   3. Test the deployed application');
}

// Run if called directly
if (require.main === module) {
  deployToVercel();
}

module.exports = { deployToVercel };
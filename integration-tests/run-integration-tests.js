#!/usr/bin/env node

/**
 * Integration test runner script
 * Runs all integration tests and provides detailed reporting
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Integration Tests for AI Product Dashboard');
console.log('=' .repeat(60));

const testSuites = [
  {
    name: 'Cross-Framework Communication',
    file: 'cross-framework-communication.integration.test.ts',
    description: 'Tests data passing between Angular and React via Web Components'
  },
  {
    name: 'API Integration',
    file: 'api-integration.integration.test.ts',
    description: 'Tests API calls with both real and mock services'
  },
  {
    name: 'End-to-End Integration',
    file: 'end-to-end-integration.integration.test.ts',
    description: 'Tests complete user workflows and component interactions'
  }
];

async function runTests() {
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  for (const suite of testSuites) {
    console.log(`\n📋 Running: ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log('-'.repeat(50));

    try {
      const startTime = Date.now();
      
      // Run the specific test file
      const output = execSync(
        `npx jest integration-tests/${suite.file} --verbose --no-cache`,
        { 
          cwd: path.join(__dirname, '..'),
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Parse Jest output for test counts
      const testMatches = output.match(/(\d+) passed/);
      const suitePassedTests = testMatches ? parseInt(testMatches[1]) : 0;
      
      totalTests += suitePassedTests;
      passedTests += suitePassedTests;

      results.push({
        name: suite.name,
        status: 'PASSED',
        tests: suitePassedTests,
        duration: duration,
        output: output
      });

      console.log(`✅ ${suite.name}: ${suitePassedTests} tests passed (${duration}ms)`);

    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      
      // Try to extract test counts from error output
      const failedMatches = errorOutput.match(/(\d+) failed/);
      const passedMatches = errorOutput.match(/(\d+) passed/);
      
      const suiteFailed = failedMatches ? parseInt(failedMatches[1]) : 1;
      const suitePassed = passedMatches ? parseInt(passedMatches[1]) : 0;
      
      totalTests += suiteFailed + suitePassed;
      passedTests += suitePassed;
      failedTests += suiteFailed;

      results.push({
        name: suite.name,
        status: 'FAILED',
        tests: suiteFailed + suitePassed,
        passed: suitePassed,
        failed: suiteFailed,
        error: errorOutput
      });

      console.log(`❌ ${suite.name}: ${suiteFailed} tests failed, ${suitePassed} tests passed`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.tests} tests (${result.duration || 'N/A'}ms)`);
  });

  console.log('\n📈 OVERALL RESULTS:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${failedTests}`);
  console.log(`   Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`);

  // Print failed test details
  const failedSuites = results.filter(r => r.status === 'FAILED');
  if (failedSuites.length > 0) {
    console.log('\n🔍 FAILURE DETAILS:');
    console.log('-'.repeat(50));
    
    failedSuites.forEach(suite => {
      console.log(`\n❌ ${suite.name}:`);
      console.log(suite.error);
    });
  }

  // Exit with appropriate code
  if (failedTests > 0) {
    console.log('\n💥 Some integration tests failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 All integration tests passed!');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Error running integration tests:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
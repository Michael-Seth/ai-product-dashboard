#!/usr/bin/env node

/**
 * Integration test runner script
 * Runs all integration tests and provides detailed reporting
 */

const { execSync } = require('child_process');
const path = require('path');
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
    try {
      const startTime = Date.now();
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
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
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
    }
  }
  results.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
  });
  const failedSuites = results.filter(r => r.status === 'FAILED');
  if (failedSuites.length > 0) {
    failedSuites.forEach(suite => {
    });
  }
  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
if (require.main === module) {
  runTests().catch(error => {
    console.error(' Error running integration tests:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
# Integration Tests

This directory contains comprehensive integration tests for the AI Product Dashboard that verify cross-framework communication between Angular and React components.

## Test Suites

### 1. Cross-Framework Communication Tests
**File:** `cross-framework-communication.integration.test.ts`

Tests the integration between Angular and React components via Web Components:
- Data passing from Angular to React via JSON attributes
- Product selection triggering recommendation updates
- Component lifecycle and cleanup
- Observable state management
- Web Component attribute changes

### 2. API Integration Tests
**File:** `api-integration.integration.test.ts`

Tests API integration with both real and mock services:
- OpenAI API integration with valid/invalid keys
- Error handling (rate limiting, authentication, network timeouts)
- Mock service fallback functionality
- Concurrent API calls
- Response validation
- Performance and reliability testing

### 3. End-to-End Integration Tests
**File:** `end-to-end-integration.integration.test.ts`

Tests complete user workflows combining Angular and React:
- Complete product selection to recommendation flow
- Product switching and state synchronization
- Loading states and error handling
- Performance with rapid selections
- Memory leak prevention
- Accessibility integration

## Running Tests

### Run All Integration Tests
```bash
# Using Nx
nx test integration-tests

# Using npm script
npm run test:integration

# Using the custom runner
node integration-tests/run-integration-tests.js
```

### Run Specific Test Suite
```bash
# Cross-framework communication only
npx jest integration-tests/cross-framework-communication.integration.test.ts

# API integration only
npx jest integration-tests/api-integration.integration.test.ts

# End-to-end integration only
npx jest integration-tests/end-to-end-integration.integration.test.ts
```

### Run Tests in Watch Mode
```bash
nx test:watch integration-tests
```

### Run Tests with Coverage
```bash
nx test:coverage integration-tests
```

## Test Requirements Covered

These integration tests fulfill the following requirements from the specification:

### Requirement 4.3: Web Component Integration
- ✅ Tests React widget embedded as Web Component in Angular
- ✅ Tests data passing from Angular to React as JSON attributes
- ✅ Tests widget state independence from Angular

### Requirement 4.4: Cross-Framework Data Flow
- ✅ Tests selected product data flow from Angular to React
- ✅ Tests widget updates without causing Angular re-renders
- ✅ Tests component lifecycle management

## Test Architecture

### Mock Components
The tests use mock implementations that simulate the real components:

- **MockAppComponent**: Simulates Angular app component with product selection
- **MockProductService**: Provides product data and state management
- **MockRecommenderElement**: Simulates React Web Component wrapper
- **MockRecommenderWidget**: Simulates React recommendation component

### Test Environment
- **Framework**: Jest with jsdom environment
- **Mocking**: Fetch API, console methods, Web Components API
- **Assertions**: Jest matchers with @testing-library/jest-dom
- **Async Testing**: Proper handling of promises and timeouts

## Key Test Scenarios

### Data Flow Testing
1. Product selection in Angular triggers state update
2. State update passes product data to React widget
3. React widget receives and processes product data
4. Widget displays recommendations based on product

### Error Handling Testing
1. Invalid JSON data handling
2. API failure fallback to mock service
3. Network timeout handling
4. Component error boundaries

### Performance Testing
1. Rapid product selection handling
2. Memory leak prevention
3. Concurrent API call management
4. Component cleanup verification

### Accessibility Testing
1. Proper ARIA attributes during state changes
2. Screen reader announcements for loading states
3. Keyboard navigation support
4. Focus management

## Debugging Tests

### Enable Verbose Output
```bash
npx jest integration-tests --verbose
```

### Debug Specific Test
```bash
npx jest integration-tests/cross-framework-communication.integration.test.ts --verbose --no-cache
```

### View Test Coverage
```bash
nx test:coverage integration-tests
open coverage/integration-tests/lcov-report/index.html
```

## Continuous Integration

These tests are designed to run in CI environments:

- No external dependencies required
- All APIs are mocked
- Deterministic test results
- Proper cleanup after each test
- Clear error reporting

## Troubleshooting

### Common Issues

1. **Web Components not defined**: Tests include polyfills for Web Components API
2. **Async timing issues**: Tests use proper async/await patterns with timeouts
3. **Memory leaks**: Tests include cleanup in afterEach hooks
4. **Mock conflicts**: Each test suite uses isolated mocks

### Test Isolation

Each test:
- Starts with a clean DOM
- Uses fresh mock instances
- Cleans up after execution
- Doesn't depend on other tests

## Contributing

When adding new integration tests:

1. Follow the existing naming convention: `*.integration.test.ts`
2. Include proper setup and cleanup
3. Use descriptive test names
4. Add comments explaining complex test scenarios
5. Update this README with new test descriptions
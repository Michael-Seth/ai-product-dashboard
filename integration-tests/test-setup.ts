import '@testing-library/jest-dom';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Reset fetch mock
  (global.fetch as jest.Mock).mockClear();
  
  // Mock console methods but allow important errors through
  console.error = jest.fn((message, ...args) => {
    if (typeof message === 'string' && (
      message.includes('Warning:') ||
      message.includes('Error:') ||
      message.includes('Failed to')
    )) {
      originalConsoleError(message, ...args);
    }
  });
  
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  
  // Clean up DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Mock Web Components API
if (!customElements.define) {
  Object.defineProperty(window, 'customElements', {
    value: {
      define: jest.fn(),
      get: jest.fn(),
      whenDefined: jest.fn(() => Promise.resolve()),
    },
    writable: true,
  });
}

// Mock HTMLElement for Web Components
if (typeof HTMLElement === 'undefined') {
  global.HTMLElement = class HTMLElement {
    style: any = {};
    innerHTML = '';
    getAttribute = jest.fn();
    setAttribute = jest.fn();
    removeAttribute = jest.fn();
    appendChild = jest.fn();
    removeChild = jest.fn();
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    dispatchEvent = jest.fn();
  } as any;
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
import '@testing-library/jest-dom';
global.fetch = jest.fn();
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
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
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
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
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
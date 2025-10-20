import '@testing-library/jest-dom';

// Mock fetch globally for RTK Query
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Request constructor for RTK Query
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  ...options,
}));

// Mock Response constructor for RTK Query with proper clone method
(global as any).Response = jest.fn().mockImplementation((body, options = {}) => {
  const response = {
    ok: options.status ? options.status < 400 : true,
    status: options.status || 200,
    statusText: options.statusText || 'OK',
    headers: new Map(),
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
    clone: jest.fn().mockReturnValue({
      ok: options.status ? options.status < 400 : true,
      status: options.status || 200,
      statusText: options.statusText || 'OK',
      headers: new Map(),
      json: jest.fn().mockResolvedValue(body),
      text: jest.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
    }),
    ...options,
  };
  return response;
});

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
  },
  writable: true,
});

// Mock performance.now for performance tests
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
  writable: true,
});

// Mock customElements for Web Component tests
Object.defineProperty(window, 'customElements', {
  value: {
    define: jest.fn(),
    get: jest.fn(),
  },
  writable: true,
});

// Mock setTimeout and clearTimeout for debouncing tests - use real timers for most tests
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

// Only mock when needed for specific tests
global.setTimeout = originalSetTimeout;
global.clearTimeout = originalClearTimeout;

// Mock HTMLElement for Web Component tests
(global as any).HTMLElement = class MockHTMLElement {
  style: any = {};
  innerHTML = '';
  parentNode: any = null;
  
  constructor() {
    this.style = {};
  }
  
  setAttribute(name: string, value: string) {
    // Mock implementation
  }
  
  getAttribute(name: string) {
    return null;
  }
  
  appendChild(child: any) {
    // Mock implementation
  }
  
  removeChild(child: any) {
    // Mock implementation
  }
  
  querySelector(selector: string) {
    return null;
  }
  
  connectedCallback() {
    // Mock implementation
  }
  
  disconnectedCallback() {
    // Mock implementation
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // Mock implementation
  }
} as unknown;
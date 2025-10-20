import '@testing-library/jest-dom';
const mockFetch = jest.fn();
global.fetch = mockFetch;
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  ...options,
}));
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
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
  },
  writable: true,
});
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
  writable: true,
});
Object.defineProperty(window, 'customElements', {
  value: {
    define: jest.fn(),
    get: jest.fn(),
  },
  writable: true,
});
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;
global.setTimeout = originalSetTimeout;
global.clearTimeout = originalClearTimeout;
(global as any).HTMLElement = class MockHTMLElement {
  style: any = {};
  innerHTML = '';
  parentNode: any = null;
  
  constructor() {
    this.style = {};
  }
  
  setAttribute(name: string, value: string) {
  }
  
  getAttribute(name: string) {
    return null;
  }
  
  appendChild(child: any) {
  }
  
  removeChild(child: any) {
  }
  
  querySelector(selector: string) {
    return null;
  }
  
  connectedCallback() {
  }
  
  disconnectedCallback() {
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
  }
} as unknown;
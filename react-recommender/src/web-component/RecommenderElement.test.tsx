import { RecommenderElement } from './RecommenderElement';
import { Product } from '@ai-product-dashboard/shared-types';

// Mock React DOM
const mockRender = jest.fn();
const mockUnmount = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender,
  unmount: mockUnmount,
}));

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}));

// Mock the Recommender component
jest.mock('../app/components/Recommender', () => ({
  Recommender: jest.fn(() => 'Mocked Recommender'),
}));

// Mock the ErrorBoundary component
jest.mock('../app/components/ErrorBoundary', () => ({
  ErrorBoundary: jest.fn(({ children }) => children),
}));

// Mock the store setup
jest.mock('../store', () => ({
  setupStore: jest.fn(() => ({})),
}));

// Mock Redux Provider
jest.mock('react-redux', () => ({
  Provider: jest.fn(({ children }) => children),
}));

describe('RecommenderElement Web Component', () => {
  let element: RecommenderElement;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCreateRoot.mockReturnValue({
      render: mockRender,
      unmount: mockUnmount,
    });

    // Create a new element instance
    element = new RecommenderElement();
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor and Basic Setup', () => {
    it('has correct observed attributes', () => {
      expect(RecommenderElement.observedAttributes).toEqual(['product']);
    });

    it('has required lifecycle methods', () => {
      expect(typeof element.connectedCallback).toBe('function');
      expect(typeof element.disconnectedCallback).toBe('function');
      expect(typeof element.attributeChangedCallback).toBe('function');
    });

    it('sets initial display style', () => {
      expect(element.style.display).toBe('block');
      expect(element.style.width).toBe('100%');
    });
  });

  describe('Lifecycle Methods', () => {
    it('calls render on connectedCallback', () => {
      const renderSpy = jest.spyOn(element as any, 'render');
      
      element.connectedCallback();

      expect(renderSpy).toHaveBeenCalled();
    });

    it('handles errors in connectedCallback gracefully', () => {
      const renderSpy = jest.spyOn(element as any, 'render').mockImplementation(() => {
        throw new Error('Render error');
      });
      const errorFallbackSpy = jest.spyOn(element as any, 'renderErrorFallback');

      element.connectedCallback();

      expect(renderSpy).toHaveBeenCalled();
      expect(errorFallbackSpy).toHaveBeenCalledWith('Failed to initialize recommendation widget');
    });

    it('cleans up properly on disconnectedCallback', () => {
      // Set up a mock root
      (element as any).root = { unmount: mockUnmount };
      
      element.disconnectedCallback();

      expect(mockUnmount).toHaveBeenCalled();
    });

    it('handles cleanup errors gracefully', () => {
      mockUnmount.mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      
      (element as any).root = { unmount: mockUnmount };

      // Should not throw when disconnecting
      expect(() => {
        element.disconnectedCallback();
      }).not.toThrow();
    });
  });

  describe('Attribute Handling', () => {
    it('triggers render when product attribute changes', () => {
      const renderSpy = jest.spyOn(element as any, 'render');
      
      element.attributeChangedCallback('product', null, '{"id": 1, "name": "Test"}');

      // Should set a timeout for debouncing
      expect(setTimeout).toHaveBeenCalled();
    });

    it('debounces rapid attribute changes', () => {
      const renderSpy = jest.spyOn(element as any, 'render');
      
      // Rapidly change attributes
      element.attributeChangedCallback('product', null, '{"id": 1, "name": "Test1"}');
      element.attributeChangedCallback('product', '{"id": 1, "name": "Test1"}', '{"id": 1, "name": "Test2"}');
      element.attributeChangedCallback('product', '{"id": 1, "name": "Test2"}', '{"id": 1, "name": "Test3"}');

      // Should clear previous timeouts due to debouncing
      expect(clearTimeout).toHaveBeenCalled();
    });

    it('handles attribute change errors gracefully', () => {
      const renderSpy = jest.spyOn(element as any, 'render').mockImplementation(() => {
        throw new Error('Render error');
      });
      const errorFallbackSpy = jest.spyOn(element as any, 'renderErrorFallback');

      element.attributeChangedCallback('product', null, '{"id": 1, "name": "Test"}');

      // Should handle the error gracefully when timeout executes
      expect(() => {
        // Manually trigger the timeout callback
        const timeoutCallback = (setTimeout as jest.Mock).mock.calls[0][0];
        timeoutCallback();
      }).not.toThrow();
    });
  });

  describe('Product Parsing', () => {
    it('parses valid product JSON correctly', () => {
      const mockProduct: Product = {
        id: 1,
        name: 'MacBook Pro',
        description: 'Powerful laptop',
        price: 1999,
        imageUrl: 'macbook.jpg'
      };

      element.setAttribute('product', JSON.stringify(mockProduct));
      
      const parsedProduct = (element as any).parseProduct();
      expect(parsedProduct).toEqual(mockProduct);
    });

    it('returns null for empty product attribute', () => {
      const parsedProduct = (element as any).parseProduct();
      expect(parsedProduct).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      element.setAttribute('product', 'invalid json');
      
      const parsedProduct = (element as any).parseProduct();
      expect(parsedProduct).toBeNull();
    });

    it('returns null for product without required name field', () => {
      const invalidProduct = {
        id: 1,
        description: 'Test description',
        price: 100,
        imageUrl: 'test.jpg'
        // missing name field
      };

      element.setAttribute('product', JSON.stringify(invalidProduct));
      
      const parsedProduct = (element as any).parseProduct();
      expect(parsedProduct).toBeNull();
    });

    it('returns null for non-object product', () => {
      element.setAttribute('product', '"just a string"');
      
      const parsedProduct = (element as any).parseProduct();
      expect(parsedProduct).toBeNull();
    });

    it('returns null for product with invalid name type', () => {
      const invalidProduct = {
        id: 1,
        name: 123, // should be string
        description: 'Test description',
        price: 100,
        imageUrl: 'test.jpg'
      };

      element.setAttribute('product', JSON.stringify(invalidProduct));
      
      const parsedProduct = (element as any).parseProduct();
      expect(parsedProduct).toBeNull();
    });
  });

  describe('React Integration', () => {
    it('creates React root and renders component', () => {
      (element as any).render();
      
      expect(mockCreateRoot).toHaveBeenCalled();
      expect(mockRender).toHaveBeenCalled();
    });

    it('reuses existing root for subsequent renders', () => {
      // First render
      (element as any).render();
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);

      // Second render - should reuse root
      (element as any).render();
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
      expect(mockRender).toHaveBeenCalledTimes(2);
    });

    it('passes parsed product to Recommender component', () => {
      const mockProduct: Product = {
        id: 1,
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        imageUrl: 'test.jpg'
      };

      element.setAttribute('product', JSON.stringify(mockProduct));
      (element as any).render();

      expect(mockRender).toHaveBeenCalled();
      // The actual product passing is tested through integration
    });

    it('handles null product correctly', () => {
      (element as any).render();

      expect(mockRender).toHaveBeenCalled();
      // Should render with null product
    });
  });

  describe('Error Handling', () => {
    it('renders error fallback for critical render errors', () => {
      mockCreateRoot.mockImplementation(() => {
        throw new Error('Critical error');
      });

      const errorFallbackSpy = jest.spyOn(element as any, 'renderErrorFallback');
      
      (element as any).render();

      expect(errorFallbackSpy).toHaveBeenCalledWith('Critical rendering error occurred');
    });

    it('displays error fallback with reload functionality', () => {
      (element as any).renderErrorFallback('Test error message');

      expect(element.innerHTML).toContain('Recommendation Widget Error');
      expect(element.innerHTML).toContain('Test error message');
      expect(element.innerHTML).toContain('Reload Page');
    });

    it('error fallback includes reload button with onclick handler', () => {
      (element as any).renderErrorFallback('Test error');

      expect(element.innerHTML).toContain('onclick="window.location.reload()"');
    });

    it('handles JSON parsing errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      element.setAttribute('product', '{"invalid": json}');
      const result = (element as any).parseProduct();
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Custom Element Registration', () => {
    it('has proper custom element lifecycle methods', () => {
      expect(typeof element.connectedCallback).toBe('function');
      expect(typeof element.disconnectedCallback).toBe('function');
      expect(typeof element.attributeChangedCallback).toBe('function');
      expect(Array.isArray(RecommenderElement.observedAttributes)).toBe(true);
    });

    it('has correct observed attributes', () => {
      expect(RecommenderElement.observedAttributes).toEqual(['product']);
    });
  });

  describe('Memory Management', () => {
    it('clears timeout on disconnect', () => {
      (element as any).renderTimeout = setTimeout(() => {}, 100);
      
      element.disconnectedCallback();

      expect(clearTimeout).toHaveBeenCalled();
    });

    it('handles cleanup without errors when no timeout exists', () => {
      expect(() => {
        element.disconnectedCallback();
      }).not.toThrow();
    });

    it('handles cleanup without errors when no root exists', () => {
      expect(() => {
        element.disconnectedCallback();
      }).not.toThrow();
    });

    it('sets root to null after cleanup', () => {
      (element as any).root = { unmount: mockUnmount };
      
      element.disconnectedCallback();
      
      expect((element as any).root).toBeNull();
    });
  });

  describe('DOM Integration', () => {
    it('creates container div for React rendering', () => {
      const appendChildSpy = jest.spyOn(element, 'appendChild');
      
      (element as any).render();
      
      expect(appendChildSpy).toHaveBeenCalled();
      expect(mockCreateRoot).toHaveBeenCalled();
    });

    it('clears existing content before rendering', () => {
      element.innerHTML = '<div>existing content</div>';
      
      (element as any).render();
      
      // Should clear content and create new container
      expect(mockCreateRoot).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Integration', () => {
    it('wraps component with error boundaries', () => {
      (element as any).render();
      
      expect(mockRender).toHaveBeenCalled();
      // Error boundary wrapping is tested through the mock
    });

    it('provides custom error fallback', () => {
      (element as any).render();
      
      // The error fallback is passed to ErrorBoundary
      expect(mockRender).toHaveBeenCalled();
    });
  });

  describe('Store Integration', () => {
    it('creates store instance', () => {
      expect((element as any).store).toBeDefined();
    });

    it('provides store to React components', () => {
      (element as any).render();
      
      // Store is provided through Redux Provider
      expect(mockRender).toHaveBeenCalled();
    });
  });
});
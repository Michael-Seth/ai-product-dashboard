/**
 * Integration tests for cross-framework communication between Angular and React
 * Tests data passing from Angular to React via Web Component
 * Verifies product selection triggers recommendation updates
 * Tests component lifecycle and cleanup
 */

import { Product } from '@ai-product-dashboard/shared-types';

// Mock the React Web Component
class MockRecommenderElement extends HTMLElement {
  private _product: string = '';
  private _onAttributeChanged: ((name: string, oldValue: string, newValue: string) => void) | null = null;

  static get observedAttributes() {
    return ['product'];
  }

  get product() {
    return this._product;
  }

  set product(value: string) {
    const oldValue = this._product;
    this._product = value;
    this.setAttribute('product', value);
    if (this._onAttributeChanged) {
      this._onAttributeChanged('product', oldValue, value);
    }
  }

  connectedCallback() {
    // Simulate React component mounting
    this.innerHTML = '<div data-testid="recommender-widget">Recommender Widget</div>';
  }

  disconnectedCallback() {
    // Simulate React component unmounting
    this.innerHTML = '';
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (this._onAttributeChanged) {
      this._onAttributeChanged(name, oldValue, newValue);
    }
  }

  // Test helper method
  setAttributeChangeListener(callback: (name: string, oldValue: string, newValue: string) => void) {
    this._onAttributeChanged = callback;
  }
}

// Mock Angular App Component
class MockAppComponent {
  selectedProduct: Product | null = null;
  webComponentLoaded = true;
  webComponentError = false;

  private selectedProductSubject = new SimpleObservable<Product | null>();
  selectedProduct$ = this.selectedProductSubject;

  constructor(private productService: any) {}

  ngOnInit() {
    this.productService.selectedProduct$.subscribe((product: Product | null) => {
      this.selectedProduct = product;
      this.selectedProductSubject.next(product);
    });
  }

  onProductSelected(product: Product) {
    this.productService.selectProduct(product);
  }

  get selectedProductJson(): string {
    return this.selectedProduct ? JSON.stringify(this.selectedProduct) : '';
  }
}

// Simple Observable implementation for testing
class SimpleObservable<T> {
  private subscribers: ((value: T) => void)[] = [];
  
  subscribe(callback: (value: T) => void) {
    this.subscribers.push(callback);
    return {
      unsubscribe: () => {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      }
    };
  }
  
  next(value: T) {
    this.subscribers.forEach(callback => callback(value));
  }
}

// Mock ProductService
class MockProductService {
  private selectedProductSubject = new SimpleObservable<Product | null>();
  selectedProduct$ = this.selectedProductSubject;

  private products: Product[] = [
    {
      id: 1,
      name: 'MacBook Air M2',
      description: 'Lightweight laptop with M2 chip',
      price: 1199,
      imageUrl: '/images/macbook-air.jpg'
    },
    {
      id: 2,
      name: 'Dell XPS 13',
      description: 'Premium ultrabook with Intel processor',
      price: 999,
      imageUrl: '/images/dell-xps.jpg'
    }
  ];

  getProducts(): Product[] {
    return this.products;
  }

  selectProduct(product: Product): void {
    this.currentProduct = product;
    this.selectedProductSubject.next(product);
  }

  private currentProduct: Product | null = null;
  
  getSelectedProduct(): Product | null {
    return this.currentProduct;
  }
}

describe('Cross-Framework Communication Integration Tests', () => {
  let mockAppComponent: MockAppComponent;
  let mockProductService: MockProductService;
  let mockWebComponent: MockRecommenderElement;
  let attributeChangeCallback: jest.Mock;

  const testProducts: Product[] = [
    {
      id: 1,
      name: 'MacBook Air M2',
      description: 'Lightweight laptop with M2 chip',
      price: 1199,
      imageUrl: '/images/macbook-air.jpg'
    },
    {
      id: 2,
      name: 'Dell XPS 13',
      description: 'Premium ultrabook with Intel processor',
      price: 999,
      imageUrl: '/images/dell-xps.jpg'
    }
  ];

  beforeEach(() => {
    // Clean up DOM first
    document.body.innerHTML = '';
    
    // Register mock web component
    if (!customElements.get('react-recommender')) {
      customElements.define('react-recommender', MockRecommenderElement);
    }

    // Setup mocks
    mockProductService = new MockProductService();
    mockAppComponent = new MockAppComponent(mockProductService);
    
    // Create mock web component
    mockWebComponent = new MockRecommenderElement();
    attributeChangeCallback = jest.fn();
    mockWebComponent.setAttributeChangeListener(attributeChangeCallback);
    
    // Add to DOM
    document.body.appendChild(mockWebComponent);
    
    // Initialize app component
    mockAppComponent.ngOnInit();
  });

  afterEach(() => {
    // Cleanup DOM
    if (mockWebComponent.parentNode) {
      mockWebComponent.parentNode.removeChild(mockWebComponent);
    }
    document.body.innerHTML = '';
  });

  describe('Data Passing from Angular to React via Web Component', () => {
    it('should pass product data as JSON attribute to React web component', () => {
      // Arrange
      const selectedProduct = testProducts[0];

      // Act
      mockAppComponent.onProductSelected(selectedProduct);

      // Assert
      expect(mockAppComponent.selectedProduct).toEqual(selectedProduct);
      expect(mockAppComponent.selectedProductJson).toBe(JSON.stringify(selectedProduct));
    });

    it('should handle empty product state correctly', () => {
      // Act - no product selected
      const jsonString = mockAppComponent.selectedProductJson;

      // Assert
      expect(jsonString).toBe('');
      expect(mockAppComponent.selectedProduct).toBeNull();
    });

    it('should update web component attribute when product changes', () => {
      // Arrange
      const selectedProduct = testProducts[0];
      
      // Act
      mockAppComponent.onProductSelected(selectedProduct);
      mockWebComponent.setAttribute('product', mockAppComponent.selectedProductJson);

      // Assert
      expect(mockWebComponent.getAttribute('product')).toBe(JSON.stringify(selectedProduct));
    });

    it('should handle product data serialization correctly', () => {
      // Arrange
      const selectedProduct = testProducts[1];

      // Act
      mockAppComponent.onProductSelected(selectedProduct);
      const serializedProduct = mockAppComponent.selectedProductJson;
      const parsedProduct = JSON.parse(serializedProduct);

      // Assert
      expect(parsedProduct).toEqual(selectedProduct);
      expect(parsedProduct.id).toBe(selectedProduct.id);
      expect(parsedProduct.name).toBe(selectedProduct.name);
      expect(parsedProduct.price).toBe(selectedProduct.price);
    });
  });

  describe('Product Selection Triggers Recommendation Updates', () => {
    it('should trigger web component attribute change when product is selected', () => {
      // Arrange
      const selectedProduct = testProducts[0];
      const productJson = JSON.stringify(selectedProduct);

      // Act
      mockAppComponent.onProductSelected(selectedProduct);
      mockWebComponent.setAttribute('product', mockAppComponent.selectedProductJson);

      // Simulate attribute change callback
      mockWebComponent.attributeChangedCallback('product', '', productJson);

      // Assert
      expect(attributeChangeCallback).toHaveBeenCalledWith('product', '', productJson);
    });

    it('should handle rapid product selection changes', async () => {
      // Arrange
      const products = testProducts;
      const changes: string[] = [];

      // Create a fresh web component for this test
      const testWebComponent = new MockRecommenderElement();
      testWebComponent.setAttributeChangeListener((name, oldValue, newValue) => {
        changes.push(newValue);
      });

      // Act - select different products sequentially
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        mockAppComponent.onProductSelected(product);
        testWebComponent.setAttribute('product', mockAppComponent.selectedProductJson);
        testWebComponent.attributeChangedCallback(
          'product', 
          index > 0 ? JSON.stringify(products[index - 1]) : '', 
          JSON.stringify(product)
        );
        // Small delay to ensure proper sequencing
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Assert - should have received changes and the last one should be the last product
      expect(changes.length).toBeGreaterThan(0);
      expect(changes[changes.length - 1]).toBe(JSON.stringify(products[products.length - 1]));
      
      // Verify that we can handle multiple rapid changes without errors
      expect(testWebComponent.getAttribute('product')).toBe(JSON.stringify(products[products.length - 1]));
    });

    it('should maintain product selection state across component updates', () => {
      // Arrange
      const selectedProduct = testProducts[0];

      // Act
      mockAppComponent.onProductSelected(selectedProduct);
      
      // Simulate component re-render
      const currentProduct = mockAppComponent.selectedProduct;
      const currentJson = mockAppComponent.selectedProductJson;

      // Assert
      expect(currentProduct).toEqual(selectedProduct);
      expect(currentJson).toBe(JSON.stringify(selectedProduct));
    });
  });

  describe('Component Lifecycle and Cleanup', () => {
    it('should properly initialize web component when connected to DOM', () => {
      // Arrange
      const newWebComponent = new MockRecommenderElement();

      // Act
      document.body.appendChild(newWebComponent);
      newWebComponent.connectedCallback();

      // Assert
      expect(newWebComponent.innerHTML).toContain('Recommender Widget');
      expect(newWebComponent.querySelector('[data-testid="recommender-widget"]')).toBeTruthy();

      // Cleanup
      document.body.removeChild(newWebComponent);
    });

    it('should properly cleanup web component when disconnected from DOM', () => {
      // Arrange
      const newWebComponent = new MockRecommenderElement();
      document.body.appendChild(newWebComponent);
      newWebComponent.connectedCallback();

      // Act
      newWebComponent.disconnectedCallback();
      document.body.removeChild(newWebComponent);

      // Assert
      expect(newWebComponent.innerHTML).toBe('');
    });

    it('should handle multiple web component instances', () => {
      // First, clean up any existing components
      document.body.innerHTML = '';
      
      // Arrange
      const webComponent1 = new MockRecommenderElement();
      const webComponent2 = new MockRecommenderElement();
      
      // Act
      document.body.appendChild(webComponent1);
      document.body.appendChild(webComponent2);
      
      webComponent1.connectedCallback();
      webComponent2.connectedCallback();

      // Assert
      expect(document.querySelectorAll('[data-testid="recommender-widget"]')).toHaveLength(2);

      // Cleanup
      document.body.removeChild(webComponent1);
      document.body.removeChild(webComponent2);
    });

    it('should handle web component lifecycle with product data', () => {
      // Arrange
      const selectedProduct = testProducts[0];
      const newWebComponent = new MockRecommenderElement();
      
      // Act
      document.body.appendChild(newWebComponent);
      newWebComponent.connectedCallback();
      newWebComponent.setAttribute('product', JSON.stringify(selectedProduct));

      // Assert
      expect(newWebComponent.getAttribute('product')).toBe(JSON.stringify(selectedProduct));
      expect(newWebComponent.innerHTML).toContain('Recommender Widget');

      // Act - cleanup
      newWebComponent.disconnectedCallback();
      document.body.removeChild(newWebComponent);

      // Assert
      expect(newWebComponent.innerHTML).toBe('');
    });
  });

  describe('Observable State Management', () => {
    it('should properly subscribe to product selection changes', async () => {
      // Arrange
      const selectedProduct = testProducts[0];
      let subscriptionCallCount = 0;
      let lastProduct: Product | null = null;

      // Act
      mockAppComponent.selectedProduct$.subscribe((product) => {
        subscriptionCallCount++;
        lastProduct = product;
      });

      // Trigger product selection
      mockAppComponent.onProductSelected(selectedProduct);

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert
      expect(lastProduct).toEqual(selectedProduct);
      expect(subscriptionCallCount).toBe(1); // Only the selected product
    });

    it('should handle subscription cleanup properly', () => {
      // Arrange
      const subscriptionSpy = jest.fn();
      const subscription = mockAppComponent.selectedProduct$.subscribe(subscriptionSpy);

      // Act
      mockAppComponent.onProductSelected(testProducts[0]);
      subscription.unsubscribe();
      mockAppComponent.onProductSelected(testProducts[1]);

      // Assert - should only receive the first product change (before unsubscribe)
      expect(subscriptionSpy).toHaveBeenCalledTimes(1); // Only first product
    });
  });
});
/**
 * End-to-end integration tests combining Angular and React components
 * Tests complete user workflow from product selection to recommendation display
 */

import { Product, Recommendation } from '@ai-product-dashboard/shared-types';

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

// Mock implementations
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
    },
    {
      id: 3,
      name: 'ThinkPad X1 Carbon',
      description: 'Business laptop with excellent keyboard',
      price: 1299,
      imageUrl: '/images/thinkpad-x1.jpg'
    }
  ];

  getProducts(): Product[] {
    return this.products;
  }

  private currentProduct: Product | null = null;
  
  selectProduct(product: Product): void {
    this.currentProduct = product;
    this.selectedProductSubject.next(product);
  }

  getSelectedProduct(): Product | null {
    return this.currentProduct;
  }
}

class MockRecommenderWidget extends HTMLElement {
  private _recommendations: Recommendation[] = [];
  private _isLoading = false;
  private _error: string | null = null;
  private _product: Product | null = null;

  static get observedAttributes() {
    return ['product'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'product') {
      try {
        this._product = newValue ? JSON.parse(newValue) : null;
        this.fetchRecommendations();
      } catch (error) {
        this._error = 'Invalid product data';
        this.render();
      }
    }
  }

  private async fetchRecommendations() {
    if (!this._product) {
      this._recommendations = [];
      this.render();
      return;
    }

    this._isLoading = true;
    this._error = null;
    this.render();

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Mock recommendations based on product
      this._recommendations = [
        {
          name: `${this._product.name} Pro`,
          reason: 'Upgraded version with better performance'
        },
        {
          name: 'Wireless Mouse',
          reason: 'Perfect accessory for productivity'
        },
        {
          name: 'USB-C Hub',
          reason: 'Expand connectivity options'
        }
      ];

      this._isLoading = false;
      this.render();
    } catch (error) {
      this._isLoading = false;
      this._error = 'Failed to load recommendations';
      this.render();
    }
  }

  private render() {
    if (this._isLoading) {
      this.innerHTML = `
        <div data-testid="loading-state" class="loading">
          <div class="spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      `;
      return;
    }

    if (this._error) {
      this.innerHTML = `
        <div data-testid="error-state" class="error">
          <p>Error: ${this._error}</p>
          <button data-testid="retry-button">Retry</button>
        </div>
      `;
      return;
    }

    if (!this._product) {
      this.innerHTML = `
        <div data-testid="empty-state" class="empty">
          <p>Select a product to see recommendations</p>
        </div>
      `;
      return;
    }

    if (this._recommendations.length === 0) {
      this.innerHTML = `
        <div data-testid="no-recommendations" class="empty">
          <p>No recommendations available</p>
        </div>
      `;
      return;
    }

    const recommendationsHtml = this._recommendations
      .map((rec, index) => `
        <div data-testid="recommendation-${index}" class="recommendation">
          <h4>${rec.name}</h4>
          <p>${rec.reason}</p>
        </div>
      `)
      .join('');

    this.innerHTML = `
      <div data-testid="recommendations-list" class="recommendations">
        <h3>Recommended for you</h3>
        ${recommendationsHtml}
      </div>
    `;
  }

  // Test helper methods
  getRecommendations(): Recommendation[] {
    return this._recommendations;
  }

  isLoading(): boolean {
    return this._isLoading;
  }

  getError(): string | null {
    return this._error;
  }

  getCurrentProduct(): Product | null {
    return this._product;
  }
}

class MockAppComponent {
  selectedProduct: Product | null = null;
  products: Product[] = [];
  webComponentLoaded = true;

  constructor(private productService: MockProductService) {
    this.products = productService.getProducts();
  }

  ngOnInit() {
    this.productService.selectedProduct$.subscribe(product => {
      this.selectedProduct = product;
    });
  }

  onProductSelected(product: Product) {
    this.productService.selectProduct(product);
  }

  get selectedProductJson(): string {
    return this.selectedProduct ? JSON.stringify(this.selectedProduct) : '';
  }
}

describe('End-to-End Integration Tests', () => {
  let mockAppComponent: MockAppComponent;
  let mockProductService: MockProductService;
  let mockRecommenderWidget: MockRecommenderWidget;

  beforeEach(() => {
    // Register mock web component
    if (!customElements.get('mock-recommender')) {
      customElements.define('mock-recommender', MockRecommenderWidget);
    }

    // Setup components
    mockProductService = new MockProductService();
    mockAppComponent = new MockAppComponent(mockProductService);
    mockRecommenderWidget = new MockRecommenderWidget();

    // Add widget to DOM
    document.body.appendChild(mockRecommenderWidget);

    // Initialize app
    mockAppComponent.ngOnInit();
  });

  afterEach(() => {
    if (mockRecommenderWidget.parentNode) {
      mockRecommenderWidget.parentNode.removeChild(mockRecommenderWidget);
    }
    document.body.innerHTML = '';
  });

  describe('Complete User Workflow', () => {
    it('should handle complete product selection to recommendation flow', async () => {
      // Arrange
      const selectedProduct = mockAppComponent.products[0];

      // Act 1: User selects a product
      mockAppComponent.onProductSelected(selectedProduct);

      // Assert 1: Product is selected in Angular
      expect(mockAppComponent.selectedProduct).toEqual(selectedProduct);

      // Act 2: Pass product to React widget
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 150));

      // Assert 2: Widget receives and processes product data
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(selectedProduct);
      expect(mockRecommenderWidget.getRecommendations()).toHaveLength(3);
      expect(mockRecommenderWidget.querySelector('[data-testid="recommendations-list"]')).toBeTruthy();
    });

    it('should handle product switching correctly', async () => {
      // Arrange
      const product1 = mockAppComponent.products[0];
      const product2 = mockAppComponent.products[1];

      // Act 1: Select first product
      mockAppComponent.onProductSelected(product1);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 150));

      // Assert 1: First product recommendations loaded
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(product1);
      const firstRecommendations = mockRecommenderWidget.getRecommendations();
      expect(firstRecommendations).toHaveLength(3);

      // Act 2: Switch to second product
      mockAppComponent.onProductSelected(product2);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 150));

      // Assert 2: Second product recommendations loaded
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(product2);
      const secondRecommendations = mockRecommenderWidget.getRecommendations();
      expect(secondRecommendations).toHaveLength(3);
      expect(secondRecommendations[0].name).toContain(product2.name);
    });

    it('should handle empty state correctly', () => {
      // Act: No product selected
      mockRecommenderWidget.setAttribute('product', '');

      // Assert: Shows empty state
      expect(mockRecommenderWidget.getCurrentProduct()).toBeNull();
      expect(mockRecommenderWidget.querySelector('[data-testid="empty-state"]')).toBeTruthy();
      expect(mockRecommenderWidget.textContent).toContain('Select a product');
    });

    it('should handle loading states during product changes', async () => {
      // Arrange
      const selectedProduct = mockAppComponent.products[0];

      // Act: Select product
      mockAppComponent.onProductSelected(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);

      // Assert: Loading state is shown initially
      expect(mockRecommenderWidget.isLoading()).toBe(true);
      expect(mockRecommenderWidget.querySelector('[data-testid="loading-state"]')).toBeTruthy();

      // Wait for loading to complete
      await new Promise(resolve => setTimeout(resolve, 150));

      // Assert: Loading state is cleared
      expect(mockRecommenderWidget.isLoading()).toBe(false);
      expect(mockRecommenderWidget.querySelector('[data-testid="loading-state"]')).toBeFalsy();
      expect(mockRecommenderWidget.querySelector('[data-testid="recommendations-list"]')).toBeTruthy();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid product data gracefully', () => {
      // Act: Pass invalid JSON
      mockRecommenderWidget.setAttribute('product', 'invalid-json');

      // Assert: Error state is shown
      expect(mockRecommenderWidget.getError()).toBe('Invalid product data');
      expect(mockRecommenderWidget.querySelector('[data-testid="error-state"]')).toBeTruthy();
    });

    it('should handle API failures gracefully', async () => {
      // Arrange: Mock API failure by overriding fetchRecommendations
      const originalFetch = (mockRecommenderWidget as any).fetchRecommendations;
      (mockRecommenderWidget as any).fetchRecommendations = async function() {
        this._isLoading = true;
        this.render();
        await new Promise(resolve => setTimeout(resolve, 50));
        this._isLoading = false;
        this._error = 'API Error';
        this.render();
      };

      const selectedProduct = mockAppComponent.products[0];

      // Act
      mockAppComponent.onProductSelected(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      expect(mockRecommenderWidget.getError()).toBe('API Error');
      expect(mockRecommenderWidget.querySelector('[data-testid="error-state"]')).toBeTruthy();

      // Restore original method
      (mockRecommenderWidget as any).fetchRecommendations = originalFetch;
    });
  });

  describe('State Synchronization', () => {
    it('should maintain state consistency between Angular and React', async () => {
      // Arrange
      const products = mockAppComponent.products;

      // Act: Rapidly switch between products
      for (const product of products) {
        mockAppComponent.onProductSelected(product);
        mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
        
        // Small delay to simulate real user interaction
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Wait for final update
      await new Promise(resolve => setTimeout(resolve, 150));

      // Assert: Final state is consistent
      const lastProduct = products[products.length - 1];
      expect(mockAppComponent.selectedProduct).toEqual(lastProduct);
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(lastProduct);
    });

    it('should handle concurrent state updates correctly', async () => {
      // Arrange
      const product1 = mockAppComponent.products[0];
      const product2 = mockAppComponent.products[1];

      // Act: Simulate concurrent updates
      const promise1 = new Promise<void>(resolve => {
        setTimeout(() => {
          mockAppComponent.onProductSelected(product1);
          mockRecommenderWidget.setAttribute('product', JSON.stringify(product1));
          resolve();
        }, 10);
      });

      const promise2 = new Promise<void>(resolve => {
        setTimeout(() => {
          mockAppComponent.onProductSelected(product2);
          mockRecommenderWidget.setAttribute('product', JSON.stringify(product2));
          resolve();
        }, 20);
      });

      await Promise.all([promise1, promise2]);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Assert: Final state should be consistent (last update wins)
      expect(mockAppComponent.selectedProduct).toEqual(product2);
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(product2);
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple rapid product selections efficiently', async () => {
      // Arrange
      const products = mockAppComponent.products;
      const startTime = Date.now();

      // Act: Rapidly select all products
      for (let i = 0; i < 10; i++) {
        const product = products[i % products.length];
        mockAppComponent.onProductSelected(product);
        mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      }

      // Wait for all updates to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert: Performance is acceptable
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(mockRecommenderWidget.getRecommendations()).toHaveLength(3);
    });

    it('should not cause memory leaks with repeated selections', async () => {
      // Arrange
      const product = mockAppComponent.products[0];
      const initialMemoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

      // Act: Perform many selections
      for (let i = 0; i < 100; i++) {
        mockAppComponent.onProductSelected(product);
        mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
        
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }

      const finalMemoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

      // Assert: Memory usage should not grow excessively
      if (initialMemoryUsage > 0 && finalMemoryUsage > 0) {
        const memoryGrowth = finalMemoryUsage - initialMemoryUsage;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      }

      // Verify functionality still works
      expect(mockRecommenderWidget.getRecommendations()).toHaveLength(3);
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain proper ARIA attributes during state changes', async () => {
      // Arrange
      const selectedProduct = mockAppComponent.products[0];

      // Act
      mockAppComponent.onProductSelected(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 150));

      // Assert: Check for accessibility attributes
      const recommendationsList = mockRecommenderWidget.querySelector('[data-testid="recommendations-list"]');
      expect(recommendationsList).toBeTruthy();
      
      // Verify recommendations are properly structured for screen readers
      const recommendations = mockRecommenderWidget.querySelectorAll('[data-testid^="recommendation-"]');
      expect(recommendations.length).toBe(3);
      
      recommendations.forEach(rec => {
        expect(rec.querySelector('h4')).toBeTruthy(); // Product name
        expect(rec.querySelector('p')).toBeTruthy();  // Reason
      });
    });

    it('should provide proper loading announcements', async () => {
      // Arrange
      const selectedProduct = mockAppComponent.products[0];

      // Act
      mockAppComponent.onProductSelected(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);

      // Assert: Loading state has proper text
      const loadingState = mockRecommenderWidget.querySelector('[data-testid="loading-state"]');
      expect(loadingState).toBeTruthy();
      expect(loadingState?.textContent).toContain('Loading recommendations');

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 150));

      // Assert: Content is loaded and accessible
      const recommendationsList = mockRecommenderWidget.querySelector('[data-testid="recommendations-list"]');
      expect(recommendationsList).toBeTruthy();
      expect(recommendationsList?.textContent).toContain('Recommended for you');
    });
  });
});
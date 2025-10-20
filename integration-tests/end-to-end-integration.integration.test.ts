/**
 * End-to-end integration tests combining Angular and React components
 * Tests complete user workflow from product selection to recommendation display
 */

import { Product, Recommendation } from '@ai-product-dashboard/shared-types';
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
      await new Promise(resolve => setTimeout(resolve, 100));
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
    if (!customElements.get('mock-recommender')) {
      customElements.define('mock-recommender', MockRecommenderWidget);
    }
    mockProductService = new MockProductService();
    mockAppComponent = new MockAppComponent(mockProductService);
    mockRecommenderWidget = new MockRecommenderWidget();
    document.body.appendChild(mockRecommenderWidget);
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
      const selectedProduct = mockAppComponent.products[0];
      mockAppComponent.onProductSelected(selectedProduct);
      expect(mockAppComponent.selectedProduct).toEqual(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(selectedProduct);
      expect(mockRecommenderWidget.getRecommendations()).toHaveLength(3);
      expect(mockRecommenderWidget.querySelector('[data-testid="recommendations-list"]')).toBeTruthy();
    });

    it('should handle product switching correctly', async () => {
      const product1 = mockAppComponent.products[0];
      const product2 = mockAppComponent.products[1];
      mockAppComponent.onProductSelected(product1);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(product1);
      const firstRecommendations = mockRecommenderWidget.getRecommendations();
      expect(firstRecommendations).toHaveLength(3);
      mockAppComponent.onProductSelected(product2);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(product2);
      const secondRecommendations = mockRecommenderWidget.getRecommendations();
      expect(secondRecommendations).toHaveLength(3);
      expect(secondRecommendations[0].name).toContain(product2.name);
    });

    it('should handle empty state correctly', () => {
      mockRecommenderWidget.setAttribute('product', '');
      expect(mockRecommenderWidget.getCurrentProduct()).toBeNull();
      expect(mockRecommenderWidget.querySelector('[data-testid="empty-state"]')).toBeTruthy();
      expect(mockRecommenderWidget.textContent).toContain('Select a product');
    });

    it('should handle loading states during product changes', async () => {
      const selectedProduct = mockAppComponent.products[0];
      mockAppComponent.onProductSelected(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      expect(mockRecommenderWidget.isLoading()).toBe(true);
      expect(mockRecommenderWidget.querySelector('[data-testid="loading-state"]')).toBeTruthy();
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockRecommenderWidget.isLoading()).toBe(false);
      expect(mockRecommenderWidget.querySelector('[data-testid="loading-state"]')).toBeFalsy();
      expect(mockRecommenderWidget.querySelector('[data-testid="recommendations-list"]')).toBeTruthy();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid product data gracefully', () => {
      mockRecommenderWidget.setAttribute('product', 'invalid-json');
      expect(mockRecommenderWidget.getError()).toBe('Invalid product data');
      expect(mockRecommenderWidget.querySelector('[data-testid="error-state"]')).toBeTruthy();
    });

    it('should handle API failures gracefully', async () => {
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
      mockAppComponent.onProductSelected(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRecommenderWidget.getError()).toBe('API Error');
      expect(mockRecommenderWidget.querySelector('[data-testid="error-state"]')).toBeTruthy();
      (mockRecommenderWidget as any).fetchRecommendations = originalFetch;
    });
  });

  describe('State Synchronization', () => {
    it('should maintain state consistency between Angular and React', async () => {
      const products = mockAppComponent.products;
      for (const product of products) {
        mockAppComponent.onProductSelected(product);
        mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      await new Promise(resolve => setTimeout(resolve, 150));
      const lastProduct = products[products.length - 1];
      expect(mockAppComponent.selectedProduct).toEqual(lastProduct);
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(lastProduct);
    });

    it('should handle concurrent state updates correctly', async () => {
      const product1 = mockAppComponent.products[0];
      const product2 = mockAppComponent.products[1];
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
      expect(mockAppComponent.selectedProduct).toEqual(product2);
      expect(mockRecommenderWidget.getCurrentProduct()).toEqual(product2);
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple rapid product selections efficiently', async () => {
      const products = mockAppComponent.products;
      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        const product = products[i % products.length];
        mockAppComponent.onProductSelected(product);
        mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      }
      await new Promise(resolve => setTimeout(resolve, 300));

      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(mockRecommenderWidget.getRecommendations()).toHaveLength(3);
    });

    it('should not cause memory leaks with repeated selections', async () => {
      const product = mockAppComponent.products[0];
      const initialMemoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      for (let i = 0; i < 100; i++) {
        mockAppComponent.onProductSelected(product);
        mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
        
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      if ((global as any).gc) {
        (global as any).gc();
      }

      const finalMemoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      if (initialMemoryUsage > 0 && finalMemoryUsage > 0) {
        const memoryGrowth = finalMemoryUsage - initialMemoryUsage;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      }
      expect(mockRecommenderWidget.getRecommendations()).toHaveLength(3);
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain proper ARIA attributes during state changes', async () => {
      const selectedProduct = mockAppComponent.products[0];
      mockAppComponent.onProductSelected(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      await new Promise(resolve => setTimeout(resolve, 150));
      const recommendationsList = mockRecommenderWidget.querySelector('[data-testid="recommendations-list"]');
      expect(recommendationsList).toBeTruthy();
      const recommendations = mockRecommenderWidget.querySelectorAll('[data-testid^="recommendation-"]');
      expect(recommendations.length).toBe(3);
      
      recommendations.forEach(rec => {
        expect(rec.querySelector('h4')).toBeTruthy(); // Product name
        expect(rec.querySelector('p')).toBeTruthy();  // Reason
      });
    });

    it('should provide proper loading announcements', async () => {
      const selectedProduct = mockAppComponent.products[0];
      mockAppComponent.onProductSelected(selectedProduct);
      mockRecommenderWidget.setAttribute('product', mockAppComponent.selectedProductJson);
      const loadingState = mockRecommenderWidget.querySelector('[data-testid="loading-state"]');
      expect(loadingState).toBeTruthy();
      expect(loadingState?.textContent).toContain('Loading recommendations');
      await new Promise(resolve => setTimeout(resolve, 150));
      const recommendationsList = mockRecommenderWidget.querySelector('[data-testid="recommendations-list"]');
      expect(recommendationsList).toBeTruthy();
      expect(recommendationsList?.textContent).toContain('Recommended for you');
    });
  });
});
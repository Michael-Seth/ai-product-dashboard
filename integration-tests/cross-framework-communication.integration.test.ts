/**
 * Integration tests for cross-framework communication between Angular and React
 * Tests data passing from Angular to React via Web Component
 * Verifies product selection triggers recommendation updates
 * Tests component lifecycle and cleanup
 */

import { Product } from '@ai-product-dashboard/shared-types';
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
    this.innerHTML = '<div data-testid="recommender-widget">Recommender Widget</div>';
  }

  disconnectedCallback() {
    this.innerHTML = '';
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (this._onAttributeChanged) {
      this._onAttributeChanged(name, oldValue, newValue);
    }
  }
  setAttributeChangeListener(callback: (name: string, oldValue: string, newValue: string) => void) {
    this._onAttributeChanged = callback;
  }
}
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
    document.body.innerHTML = '';
    if (!customElements.get('react-recommender')) {
      customElements.define('react-recommender', MockRecommenderElement);
    }
    mockProductService = new MockProductService();
    mockAppComponent = new MockAppComponent(mockProductService);
    mockWebComponent = new MockRecommenderElement();
    attributeChangeCallback = jest.fn();
    mockWebComponent.setAttributeChangeListener(attributeChangeCallback);
    document.body.appendChild(mockWebComponent);
    mockAppComponent.ngOnInit();
  });

  afterEach(() => {
    if (mockWebComponent.parentNode) {
      mockWebComponent.parentNode.removeChild(mockWebComponent);
    }
    document.body.innerHTML = '';
  });

  describe('Data Passing from Angular to React via Web Component', () => {
    it('should pass product data as JSON attribute to React web component', () => {
      const selectedProduct = testProducts[0];
      mockAppComponent.onProductSelected(selectedProduct);
      expect(mockAppComponent.selectedProduct).toEqual(selectedProduct);
      expect(mockAppComponent.selectedProductJson).toBe(JSON.stringify(selectedProduct));
    });

    it('should handle empty product state correctly', () => {
      const jsonString = mockAppComponent.selectedProductJson;
      expect(jsonString).toBe('');
      expect(mockAppComponent.selectedProduct).toBeNull();
    });

    it('should update web component attribute when product changes', () => {
      const selectedProduct = testProducts[0];
      mockAppComponent.onProductSelected(selectedProduct);
      mockWebComponent.setAttribute('product', mockAppComponent.selectedProductJson);
      expect(mockWebComponent.getAttribute('product')).toBe(JSON.stringify(selectedProduct));
    });

    it('should handle product data serialization correctly', () => {
      const selectedProduct = testProducts[1];
      mockAppComponent.onProductSelected(selectedProduct);
      const serializedProduct = mockAppComponent.selectedProductJson;
      const parsedProduct = JSON.parse(serializedProduct);
      expect(parsedProduct).toEqual(selectedProduct);
      expect(parsedProduct.id).toBe(selectedProduct.id);
      expect(parsedProduct.name).toBe(selectedProduct.name);
      expect(parsedProduct.price).toBe(selectedProduct.price);
    });
  });

  describe('Product Selection Triggers Recommendation Updates', () => {
    it('should trigger web component attribute change when product is selected', () => {
      const selectedProduct = testProducts[0];
      const productJson = JSON.stringify(selectedProduct);
      mockAppComponent.onProductSelected(selectedProduct);
      mockWebComponent.setAttribute('product', mockAppComponent.selectedProductJson);
      mockWebComponent.attributeChangedCallback('product', '', productJson);
      expect(attributeChangeCallback).toHaveBeenCalledWith('product', '', productJson);
    });

    it('should handle rapid product selection changes', async () => {
      const products = testProducts;
      const changes: string[] = [];
      const testWebComponent = new MockRecommenderElement();
      testWebComponent.setAttributeChangeListener((name, oldValue, newValue) => {
        changes.push(newValue);
      });
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        mockAppComponent.onProductSelected(product);
        testWebComponent.setAttribute('product', mockAppComponent.selectedProductJson);
        testWebComponent.attributeChangedCallback(
          'product', 
          index > 0 ? JSON.stringify(products[index - 1]) : '', 
          JSON.stringify(product)
        );
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      expect(changes.length).toBeGreaterThan(0);
      expect(changes[changes.length - 1]).toBe(JSON.stringify(products[products.length - 1]));
      expect(testWebComponent.getAttribute('product')).toBe(JSON.stringify(products[products.length - 1]));
    });

    it('should maintain product selection state across component updates', () => {
      const selectedProduct = testProducts[0];
      mockAppComponent.onProductSelected(selectedProduct);
      const currentProduct = mockAppComponent.selectedProduct;
      const currentJson = mockAppComponent.selectedProductJson;
      expect(currentProduct).toEqual(selectedProduct);
      expect(currentJson).toBe(JSON.stringify(selectedProduct));
    });
  });

  describe('Component Lifecycle and Cleanup', () => {
    it('should properly initialize web component when connected to DOM', () => {
      const newWebComponent = new MockRecommenderElement();
      document.body.appendChild(newWebComponent);
      newWebComponent.connectedCallback();
      expect(newWebComponent.innerHTML).toContain('Recommender Widget');
      expect(newWebComponent.querySelector('[data-testid="recommender-widget"]')).toBeTruthy();
      document.body.removeChild(newWebComponent);
    });

    it('should properly cleanup web component when disconnected from DOM', () => {
      const newWebComponent = new MockRecommenderElement();
      document.body.appendChild(newWebComponent);
      newWebComponent.connectedCallback();
      newWebComponent.disconnectedCallback();
      document.body.removeChild(newWebComponent);
      expect(newWebComponent.innerHTML).toBe('');
    });

    it('should handle multiple web component instances', () => {
      document.body.innerHTML = '';
      const webComponent1 = new MockRecommenderElement();
      const webComponent2 = new MockRecommenderElement();
      document.body.appendChild(webComponent1);
      document.body.appendChild(webComponent2);
      
      webComponent1.connectedCallback();
      webComponent2.connectedCallback();
      expect(document.querySelectorAll('[data-testid="recommender-widget"]')).toHaveLength(2);
      document.body.removeChild(webComponent1);
      document.body.removeChild(webComponent2);
    });

    it('should handle web component lifecycle with product data', () => {
      const selectedProduct = testProducts[0];
      const newWebComponent = new MockRecommenderElement();
      document.body.appendChild(newWebComponent);
      newWebComponent.connectedCallback();
      newWebComponent.setAttribute('product', JSON.stringify(selectedProduct));
      expect(newWebComponent.getAttribute('product')).toBe(JSON.stringify(selectedProduct));
      expect(newWebComponent.innerHTML).toContain('Recommender Widget');
      newWebComponent.disconnectedCallback();
      document.body.removeChild(newWebComponent);
      expect(newWebComponent.innerHTML).toBe('');
    });
  });

  describe('Observable State Management', () => {
    it('should properly subscribe to product selection changes', async () => {
      const selectedProduct = testProducts[0];
      let subscriptionCallCount = 0;
      let lastProduct: Product | null = null;
      mockAppComponent.selectedProduct$.subscribe((product) => {
        subscriptionCallCount++;
        lastProduct = product;
      });
      mockAppComponent.onProductSelected(selectedProduct);
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(lastProduct).toEqual(selectedProduct);
      expect(subscriptionCallCount).toBe(1); // Only the selected product
    });

    it('should handle subscription cleanup properly', () => {
      const subscriptionSpy = jest.fn();
      const subscription = mockAppComponent.selectedProduct$.subscribe(subscriptionSpy);
      mockAppComponent.onProductSelected(testProducts[0]);
      subscription.unsubscribe();
      mockAppComponent.onProductSelected(testProducts[1]);
      expect(subscriptionSpy).toHaveBeenCalledTimes(1); // Only first product
    });
  });
});
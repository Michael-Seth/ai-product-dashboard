import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { Product } from '@ai-product-dashboard/shared-types';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return an array of products', () => {
      const products = service.getProducts();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
    });

    it('should return products with required properties', () => {
      const products = service.getProducts();
      products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('imageUrl');
        expect(typeof product.id).toBe('number');
        expect(typeof product.name).toBe('string');
        expect(typeof product.description).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(typeof product.imageUrl).toBe('string');
      });
    });

    it('should return a copy of products array to prevent mutations', () => {
      const products1 = service.getProducts();
      const products2 = service.getProducts();
      expect(products1).not.toBe(products2); // Different array instances
      expect(products1).toEqual(products2); // Same content
    });

    it('should include laptop products', () => {
      const products = service.getProducts();
      const productNames = products.map(p => p.name);
      expect(productNames).toContain('MacBook Air M2');
      expect(productNames).toContain('Dell XPS 13');
      expect(productNames).toContain('ThinkPad X1 Carbon');
      expect(productNames).toContain('HP Spectre x360');
    });
  });

  describe('selectProduct', () => {
    it('should start with no selected product', () => {
      expect(service.getSelectedProduct()).toBeNull();
    });

    it('should update selected product when selectProduct is called', () => {
      const products = service.getProducts();
      const testProduct = products[0];
      
      service.selectProduct(testProduct);
      expect(service.getSelectedProduct()).toEqual(testProduct);
    });

    it('should allow clearing selection by passing null', () => {
      const products = service.getProducts();
      const testProduct = products[0];
      service.selectProduct(testProduct);
      expect(service.getSelectedProduct()).toEqual(testProduct);
      service.selectProduct(null);
      expect(service.getSelectedProduct()).toBeNull();
    });
  });

  describe('selectedProduct$ observable', () => {
    it('should emit null initially', (done) => {
      service.selectedProduct$.subscribe(product => {
        expect(product).toBeNull();
        done();
      });
    });

    it('should emit new product when selection changes', (done) => {
      const products = service.getProducts();
      const testProduct = products[0];
      let emissionCount = 0;

      service.selectedProduct$.subscribe(product => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(product).toBeNull(); // Initial value
          service.selectProduct(testProduct);
        } else if (emissionCount === 2) {
          expect(product).toEqual(testProduct); // Updated value
          done();
        }
      });
    });

    it('should emit multiple changes correctly', (done) => {
      const products = service.getProducts();
      const product1 = products[0];
      const product2 = products[1];
      let emissionCount = 0;

      service.selectedProduct$.subscribe(product => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(product).toBeNull();
          service.selectProduct(product1);
        } else if (emissionCount === 2) {
          expect(product).toEqual(product1);
          service.selectProduct(product2);
        } else if (emissionCount === 3) {
          expect(product).toEqual(product2);
          service.selectProduct(null);
        } else if (emissionCount === 4) {
          expect(product).toBeNull();
          done();
        }
      });
    });

    it('should emit values when same product is selected twice (BehaviorSubject behavior)', (done) => {
      const products = service.getProducts();
      const testProduct = products[0];
      let emissionCount = 0;

      service.selectedProduct$.subscribe(product => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(product).toBeNull();
          service.selectProduct(testProduct);
        } else if (emissionCount === 2) {
          expect(product).toEqual(testProduct);
          service.selectProduct(testProduct);
        } else if (emissionCount === 3) {
          expect(product).toEqual(testProduct);
          done();
        }
      });
    });

    it('should handle rapid selection changes', (done) => {
      const products = service.getProducts();
      let emissionCount = 0;
      const expectedProducts = [null, products[0], products[1], products[2], null];

      service.selectedProduct$.subscribe(product => {
        expect(product).toEqual(expectedProducts[emissionCount]);
        emissionCount++;
        if (emissionCount === expectedProducts.length) {
          done();
        }
      });
      service.selectProduct(products[0]);
      service.selectProduct(products[1]);
      service.selectProduct(products[2]);
      service.selectProduct(null);
    });
  });

  describe('data integrity', () => {
    it('should maintain consistent product data across multiple calls', () => {
      const products1 = service.getProducts();
      const products2 = service.getProducts();
      
      expect(products1).toEqual(products2);
      expect(products1.length).toBe(products2.length);
      products1.forEach((product, index) => {
        expect(product).toEqual(products2[index]);
        expect(product.id).toBe(products2[index].id);
        expect(product.name).toBe(products2[index].name);
      });
    });

    it('should have valid product data structure', () => {
      const products = service.getProducts();
      
      products.forEach(product => {
        expect(product.id).toBeGreaterThan(0);
        expect(product.name).toBeTruthy();
        expect(product.description).toBeTruthy();
        expect(product.price).toBeGreaterThan(0);
        expect(product.imageUrl).toMatch(/^https?:\/\//);
      });
    });

    it('should have unique product IDs', () => {
      const products = service.getProducts();
      const ids = products.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(uniqueIds.length).toBe(products.length);
    });
  });
});
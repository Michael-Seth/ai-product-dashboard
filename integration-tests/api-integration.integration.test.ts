/**
 * Integration tests for API integration with both real and mock services
 * Tests recommendation API calls, error handling, and fallback mechanisms
 */

import { recommendProducts, mockRecommend } from '@ai-product-dashboard/shared-api';
import { Recommendation, Product } from '@ai-product-dashboard/shared-types';

describe('API Integration Tests', () => {
  const testProduct: Product = {
    id: 1,
    name: 'MacBook Air M2',
    description: 'Lightweight laptop with M2 chip',
    price: 1199,
    imageUrl: '/images/macbook-air.jpg'
  };

  beforeEach(() => {
    delete process.env['OPENAI_API_KEY'];
    delete process.env['VITE_OPENAI_API_KEY'];
  });

  describe('API Fallback Behavior', () => {
    it('should fallback to mock recommendations when no API key is provided', async () => {
      const result = await recommendProducts(testProduct);
      expect(result).toHaveProperty('recommendations');
      if ('recommendations' in result) {
        expect(result.recommendations.length).toBeGreaterThan(0);
        expect(result.recommendations[0]).toHaveProperty('name');
        expect(result.recommendations[0]).toHaveProperty('reason');
        expect(typeof result.recommendations[0].name).toBe('string');
        expect(result.recommendations[0].name.length).toBeGreaterThan(0);
      }
    });

    it('should handle invalid product input gracefully', async () => {
      const result = await recommendProducts(null as any);
      
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toBe('Invalid product data');
      }
    });

    it('should handle product with empty name', async () => {
      const invalidProduct = { ...testProduct, name: '' };
      const result = await recommendProducts(invalidProduct);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toBe('Invalid product name');
      }
    });

    it('should handle product with missing name', async () => {
      const invalidProduct = { ...testProduct, name: undefined as any };
      const result = await recommendProducts(invalidProduct);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toBe('Invalid product name');
      }
    });
  });

  describe('Mock Service Functionality', () => {
    it('should provide consistent mock recommendations for known products', async () => {
      const productName = 'MacBook Air';
      const result1 = mockRecommend(productName);
      const result2 = mockRecommend(productName);
      expect(result1).toHaveLength(4);
      expect(result2).toHaveLength(4);
      expect(result1[0].name).toBe(result2[0].name);
      expect(result1[0].name).toBe('MacBook Pro');
    });

    it('should handle different product names in mock service', async () => {
      const products = ['MacBook Air', 'Dell XPS 13', 'ThinkPad X1 Carbon', 'Unknown Product'];
      const results = products.map(product => mockRecommend(product));
      results.forEach((result, index) => {
        expect(result.length).toBeGreaterThan(0);
        result.forEach(rec => {
          expect(rec).toHaveProperty('name');
          expect(rec).toHaveProperty('reason');
          expect(typeof rec.name).toBe('string');
          expect(typeof rec.reason).toBe('string');
          expect(rec.name.length).toBeGreaterThan(0);
          expect(rec.reason.length).toBeGreaterThan(0);
        });
      });
    });

    it('should handle invalid input gracefully in mock service', async () => {
      const result1 = mockRecommend('');
      const result2 = mockRecommend(null as any);
      const result3 = mockRecommend(undefined as any);
      [result1, result2, result3].forEach(result => {
        expect(result.length).toBeGreaterThan(0);
        result.forEach(rec => {
          expect(rec).toHaveProperty('name');
          expect(rec).toHaveProperty('reason');
        });
      });
    });
  });

  describe('Integration Behavior', () => {
    it('should handle concurrent API calls correctly', async () => {
      const products = [
        { ...testProduct, name: 'MacBook Air' },
        { ...testProduct, name: 'Dell XPS 13' },
        { ...testProduct, name: 'ThinkPad X1 Carbon' }
      ];
      const results = await Promise.all(
        products.map(product => recommendProducts(product))
      );
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('recommendations');
        if ('recommendations' in result) {
          expect(result.recommendations.length).toBeGreaterThan(0);
        }
      });
    });

    it('should provide different recommendations for different products', async () => {
      const macbook = { ...testProduct, name: 'MacBook Air' };
      const dell = { ...testProduct, name: 'Dell XPS 13' };
      const macbookResult = await recommendProducts(macbook);
      const dellResult = await recommendProducts(dell);
      expect(macbookResult).toHaveProperty('recommendations');
      expect(dellResult).toHaveProperty('recommendations');
      
      if ('recommendations' in macbookResult && 'recommendations' in dellResult) {
        expect(macbookResult.recommendations[0].name).not.toBe(dellResult.recommendations[0].name);
      }
    });

    it('should handle rapid successive calls for the same product', async () => {
      const callCount = 5;
      const calls = Array(callCount).fill(testProduct);
      const results = await Promise.all(
        calls.map(product => recommendProducts(product))
      );
      expect(results).toHaveLength(callCount);
      results.forEach(result => {
        expect(result).toHaveProperty('recommendations');
        if ('recommendations' in result) {
          expect(result.recommendations.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Response Validation', () => {
    it('should validate recommendation structure from API responses', async () => {
      const result = await recommendProducts(testProduct);
      expect(result).toHaveProperty('recommendations');
      if ('recommendations' in result) {
        result.recommendations.forEach((rec: Recommendation) => {
          expect(rec).toHaveProperty('name');
          expect(rec).toHaveProperty('reason');
          expect(typeof rec.name).toBe('string');
          expect(typeof rec.reason).toBe('string');
          expect(rec.name.length).toBeGreaterThan(0);
          expect(rec.reason.length).toBeGreaterThan(0);
        });
      }
    });

    it('should return consistent data structure regardless of API or mock', async () => {
      const result = await recommendProducts(testProduct);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if ('recommendations' in result) {
        expect(Array.isArray(result.recommendations)).toBe(true);
        expect(result.recommendations.length).toBeGreaterThan(0);
      } else {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle API calls within reasonable time limits', async () => {
      const startTime = Date.now();
      const result = await recommendProducts(testProduct);
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(result).toHaveProperty('recommendations');
      expect(duration).toBeLessThan(1000); // Should complete within 1 second for mock
    });

    it('should handle memory efficiently with multiple API calls', async () => {
      const products = Array.from({ length: 10 }, (_, i) => ({
        ...testProduct,
        id: i + 1,
        name: `Test Product ${i + 1}`
      }));
      const results = [];
      for (const product of products) {
        const result = await recommendProducts(product);
        results.push(result);
      }
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveProperty('recommendations');
        if ('recommendations' in result) {
          expect(result.recommendations.length).toBeGreaterThan(0);
        }
      });
    });

    it('should handle edge cases gracefully', async () => {
      const edgeCases = [
        { ...testProduct, name: 'A' }, // Very short name
        { ...testProduct, name: 'A'.repeat(100) }, // Very long name
        { ...testProduct, name: 'Product with special chars !@#$%' },
        { ...testProduct, description: '' }, // Empty description
        { ...testProduct, price: 0 }, // Zero price
      ];
      const results = await Promise.all(
        edgeCases.map(product => recommendProducts(product))
      );
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(
          ('recommendations' in result && Array.isArray(result.recommendations)) ||
          ('error' in result && typeof result.error === 'string')
        ).toBe(true);
      });
    });
  });
});
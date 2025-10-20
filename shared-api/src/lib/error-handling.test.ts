import { recommendProducts, mockRecommend, resetOpenAIClient } from './shared-api';
import { Product, isAPIError } from '@ai-product-dashboard/shared-types';
jest.mock('openai');

describe('Error Handling Tests', () => {
  beforeEach(() => {
    resetOpenAIClient();
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should handle null product input', async () => {
      const result = await recommendProducts(null as any);
      
      expect(isAPIError(result)).toBe(true);
      if (isAPIError(result)) {
        expect(result.error).toBe('Invalid product data');
        expect(result.message).toContain('Product information is required');
      }
    });

    it('should handle undefined product input', async () => {
      const result = await recommendProducts(undefined as any);
      
      expect(isAPIError(result)).toBe(true);
      if (isAPIError(result)) {
        expect(result.error).toBe('Invalid product data');
      }
    });

    it('should handle product with empty name', async () => {
      const product: Product = {
        id: 1,
        name: '',
        description: 'Test product',
        price: 100,
        imageUrl: 'test.jpg'
      };

      const result = await recommendProducts(product);
      
      expect(isAPIError(result)).toBe(true);
      if (isAPIError(result)) {
        expect(result.error).toBe('Invalid product name');
      }
    });

    it('should handle product with whitespace-only name', async () => {
      const product: Product = {
        id: 1,
        name: '   ',
        description: 'Test product',
        price: 100,
        imageUrl: 'test.jpg'
      };

      const result = await recommendProducts(product);
      
      expect(isAPIError(result)).toBe(true);
      if (isAPIError(result)) {
        expect(result.error).toBe('Invalid product name');
      }
    });

    it('should handle product with non-string name', async () => {
      const product = {
        id: 1,
        name: 123,
        description: 'Test product',
        price: 100,
        imageUrl: 'test.jpg'
      } as any;

      const result = await recommendProducts(product);
      
      expect(isAPIError(result)).toBe(true);
      if (isAPIError(result)) {
        expect(result.error).toBe('Invalid product name');
      }
    });
  });

  describe('Network Error Handling', () => {
    it('should fall back to mock recommendations on network error', async () => {
      const mockOpenAI = require('openai');
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('network error'))
          }
        }
      }));
      process.env.OPENAI_API_KEY = 'test-key';

      const product: Product = {
        id: 1,
        name: 'MacBook Air',
        description: 'Apple laptop',
        price: 999,
        imageUrl: 'test.jpg'
      };

      const result = await recommendProducts(product);
      
      expect(isAPIError(result)).toBe(false);
      if (!isAPIError(result)) {
        expect(result.recommendations).toBeDefined();
        expect(Array.isArray(result.recommendations)).toBe(true);
        expect(result.recommendations.length).toBeGreaterThan(0);
      }

      delete process.env.OPENAI_API_KEY;
    });

    it('should handle timeout errors gracefully', async () => {
      const mockOpenAI = require('openai');
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('Request timeout after 10 seconds'))
          }
        }
      }));

      process.env.OPENAI_API_KEY = 'test-key';

      const product: Product = {
        id: 1,
        name: 'Dell XPS 13',
        description: 'Dell laptop',
        price: 899,
        imageUrl: 'test.jpg'
      };

      const result = await recommendProducts(product);
      
      expect(isAPIError(result)).toBe(false);
      if (!isAPIError(result)) {
        expect(result.recommendations).toBeDefined();
        expect(result.recommendations.length).toBeGreaterThan(0);
      }

      delete process.env.OPENAI_API_KEY;
    });
  });

  describe('API Response Validation', () => {
    it('should handle invalid JSON response from OpenAI', async () => {
      const mockOpenAI = require('openai');
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: 'Invalid JSON response'
                }
              }]
            })
          }
        }
      }));

      process.env.OPENAI_API_KEY = 'test-key';

      const product: Product = {
        id: 1,
        name: 'ThinkPad X1 Carbon',
        description: 'Lenovo laptop',
        price: 1299,
        imageUrl: 'test.jpg'
      };

      const result = await recommendProducts(product);
      
      expect(isAPIError(result)).toBe(false);
      if (!isAPIError(result)) {
        expect(result.recommendations).toBeDefined();
        expect(result.recommendations.length).toBeGreaterThan(0);
      }

      delete process.env.OPENAI_API_KEY;
    });

    it('should handle missing recommendations array in response', async () => {
      const mockOpenAI = require('openai');
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: JSON.stringify({ invalid: 'response' })
                }
              }]
            })
          }
        }
      }));

      process.env.OPENAI_API_KEY = 'test-key';

      const product: Product = {
        id: 1,
        name: 'MacBook Pro',
        description: 'Apple laptop',
        price: 1999,
        imageUrl: 'test.jpg'
      };

      const result = await recommendProducts(product);
      
      expect(isAPIError(result)).toBe(false);
      if (!isAPIError(result)) {
        expect(result.recommendations).toBeDefined();
        expect(result.recommendations.length).toBeGreaterThan(0);
      }

      delete process.env.OPENAI_API_KEY;
    });

    it('should filter out invalid recommendations', async () => {
      const mockOpenAI = require('openai');
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: JSON.stringify({
                    recommendations: [
                      { name: 'Valid Product', reason: 'Good reason' },
                      { name: '', reason: 'Invalid - empty name' },
                      { name: 'Another Valid', reason: '' }, // Invalid - empty reason
                      { name: 'Third Valid', reason: 'Another good reason' },
                      null, // Invalid - null
                      { name: 'Fourth Valid' }, // Invalid - missing reason
                    ]
                  })
                }
              }]
            })
          }
        }
      }));

      process.env.OPENAI_API_KEY = 'test-key';

      const product: Product = {
        id: 1,
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        imageUrl: 'test.jpg'
      };

      const result = await recommendProducts(product);
      
      expect(isAPIError(result)).toBe(false);
      if (!isAPIError(result)) {
        expect(result.recommendations).toBeDefined();
        expect(result.recommendations.length).toBe(2); // Only 2 valid recommendations
        expect(result.recommendations[0].name).toBe('Valid Product');
        expect(result.recommendations[1].name).toBe('Third Valid');
      }

      delete process.env.OPENAI_API_KEY;
    });
  });

  describe('Mock Recommendations', () => {
    it('should handle invalid product name in mock function', () => {
      const result = mockRecommend('');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle null product name in mock function', () => {
      const result = mockRecommend(null as any);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return specific recommendations for known products', () => {
      const result = mockRecommend('MacBook Air');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('MacBook Pro');
    });

    it('should return generic recommendations for unknown products', () => {
      const result = mockRecommend('Unknown Product');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Laptop Stand');
    });
  });

  describe('Extreme Error Scenarios', () => {
    it('should handle complete service failure gracefully', async () => {
      const mockOpenAI = require('openai');
      mockOpenAI.mockImplementation(() => {
        throw new Error('Complete service failure');
      });

      process.env.OPENAI_API_KEY = 'test-key';

      const product: Product = {
        id: 1,
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        imageUrl: 'test.jpg'
      };

      const result = await recommendProducts(product);
      expect(isAPIError(result)).toBe(false);
      if (!isAPIError(result)) {
        expect(result.recommendations).toBeDefined();
        expect(result.recommendations.length).toBeGreaterThan(0);
      }

      delete process.env.OPENAI_API_KEY;
    });
  });
});
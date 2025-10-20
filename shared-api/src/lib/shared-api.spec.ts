import { recommendProducts, mockRecommend, resetOpenAIClient } from './shared-api';
import { Product } from '@ai-product-dashboard/shared-types';

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
});

describe('shared-api', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'MacBook Air',
    description: 'Lightweight laptop with M2 chip',
    price: 1199,
    imageUrl: 'https://example.com/macbook.jpg'
  };

  describe('mockRecommend', () => {
    it('should return specific recommendations for known products', () => {
      const recommendations = mockRecommend('MacBook Air');
      
      expect(recommendations).toHaveLength(4);
      expect(recommendations[0]).toEqual({
        name: 'MacBook Pro',
        reason: 'More powerful processor and better graphics for demanding tasks'
      });
      expect(recommendations.every(rec => rec.name && rec.reason)).toBe(true);
    });

    it('should return generic recommendations for unknown products', () => {
      const recommendations = mockRecommend('Unknown Product');
      
      expect(recommendations).toHaveLength(4);
      expect(recommendations[0]).toEqual({
        name: 'Laptop Stand',
        reason: 'Improve ergonomics and airflow for any laptop'
      });
      expect(recommendations.every(rec => rec.name && rec.reason)).toBe(true);
    });
  });

  describe('recommendProducts', () => {
    beforeEach(() => {

      delete process.env['OPENAI_API_KEY'];
      delete process.env['VITE_OPENAI_API_KEY'];
      jest.clearAllMocks();
      resetOpenAIClient();
    });

    it('should fall back to mock recommendations when no API key is provided', async () => {
      const result = await recommendProducts(mockProduct);
      
      expect(result).toHaveProperty('recommendations');
      if ('recommendations' in result) {
        expect(result.recommendations).toHaveLength(4);
        expect(result.recommendations[0].name).toBe('MacBook Pro');
      }
    });

    it('should handle OpenAI API success', async () => {

      process.env['OPENAI_API_KEY'] = 'test-api-key';

      const mockOpenAI = require('openai').default;
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              recommendations: [
                { name: 'Test Product 1', reason: 'Test reason 1' },
                { name: 'Test Product 2', reason: 'Test reason 2' }
              ]
            })
          }
        }]
      });
      
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await recommendProducts(mockProduct);
      
      expect(result).toHaveProperty('recommendations');
      if ('recommendations' in result) {
        expect(result.recommendations).toHaveLength(2);
        expect(result.recommendations[0]).toEqual({
          name: 'Test Product 1',
          reason: 'Test reason 1'
        });
      }
    });

    it('should fall back to mock recommendations when OpenAI API fails', async () => {

      process.env['OPENAI_API_KEY'] = 'test-api-key';

      const mockOpenAI = require('openai').default;
      const mockCreate = jest.fn().mockRejectedValue(new Error('API key error'));
      
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await recommendProducts(mockProduct);
      
      expect(result).toHaveProperty('recommendations');
      if ('recommendations' in result) {
        expect(result.recommendations).toHaveLength(4);
        expect(result.recommendations[0].name).toBe('MacBook Pro');
      }
    });

    it('should return error for non-API related failures', async () => {

      process.env['OPENAI_API_KEY'] = 'test-api-key';

      const mockOpenAI = require('openai').default;
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'invalid json'
          }
        }]
      });
      
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));

      const result = await recommendProducts(mockProduct);
      
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toBe('Failed to generate recommendations');
        expect(result.message).toContain('Unexpected token');
      }
    });
  });
});

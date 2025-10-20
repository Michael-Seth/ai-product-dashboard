import { Product, Recommendation, RecommendationResponse, APIError, isAPIError } from './shared-types';

describe('shared-types', () => {
  describe('Product interface', () => {
    it('should define a valid product structure', () => {
      const product: Product = {
        id: 1,
        name: 'MacBook Air',
        description: 'Lightweight laptop with M2 chip',
        price: 1199,
        imageUrl: 'https://via.placeholder.com/300x200'
      };

      expect(product.id).toBe(1);
      expect(product.name).toBe('MacBook Air');
      expect(product.description).toBe('Lightweight laptop with M2 chip');
      expect(product.price).toBe(1199);
      expect(product.imageUrl).toBe('https://via.placeholder.com/300x200');
    });
  });

  describe('Recommendation interface', () => {
    it('should define a valid recommendation structure', () => {
      const recommendation: Recommendation = {
        name: 'MacBook Pro',
        reason: 'Similar performance with more power for professional work'
      };

      expect(recommendation.name).toBe('MacBook Pro');
      expect(recommendation.reason).toBe('Similar performance with more power for professional work');
    });
  });

  describe('RecommendationResponse interface', () => {
    it('should define a valid response structure', () => {
      const response: RecommendationResponse = {
        recommendations: [
          { name: 'MacBook Pro', reason: 'More powerful option' },
          { name: 'iPad Pro', reason: 'Portable alternative' }
        ]
      };

      expect(response.recommendations).toHaveLength(2);
      expect(response.recommendations[0].name).toBe('MacBook Pro');
    });
  });

  describe('APIError interface', () => {
    it('should define a valid error structure', () => {
      const error: APIError = {
        error: 'API_FAILURE',
        message: 'Failed to fetch recommendations'
      };

      expect(error.error).toBe('API_FAILURE');
      expect(error.message).toBe('Failed to fetch recommendations');
    });

    it('should work without optional message', () => {
      const error: APIError = {
        error: 'NETWORK_ERROR'
      };

      expect(error.error).toBe('NETWORK_ERROR');
      expect(error.message).toBeUndefined();
    });
  });

  describe('isAPIError type guard', () => {
    it('should identify API errors correctly', () => {
      const error = { error: 'TEST_ERROR', message: 'Test message' };
      const success = { recommendations: [] };

      expect(isAPIError(error)).toBe(true);
      expect(isAPIError(success)).toBe(false);
      expect(isAPIError(null)).toBe(false);
      expect(isAPIError(undefined)).toBe(false);
    });
  });
});

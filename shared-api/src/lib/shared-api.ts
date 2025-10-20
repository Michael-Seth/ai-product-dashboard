import {
  Product,
  Recommendation,
  RecommendationResponse,
  APIError,
} from '@ai-product-dashboard/shared-types';

import { getAIService, mockRecommend as mockRecommendFromService } from './ai-service';

/**
 * Reset function for backward compatibility (now resets AI service)
 */
export function resetOpenAIClient(): void {

}

/**
 * Mock recommendation function for backward compatibility
 */
export function mockRecommend(productName: string): Recommendation[] {
  return mockRecommendFromService(productName);
}

/**
 * Generate AI-powered product recommendations using the new adapter system
 * This function maintains backward compatibility while using the new multi-provider system
 */
export async function recommendProducts(
  product: Product
): Promise<RecommendationResponse | APIError> {
  try {

    const aiService = getAIService();
    const result = await aiService.generateRecommendations(product);

    const activeProvider = aiService.getActiveProvider();
    if (activeProvider) {

    }
    
    return result;
    
  } catch (error) {
    console.error('Error in recommendProducts:', error);

    if (product?.name) {
      return {
        recommendations: mockRecommend(product.name),
      };
    }
    
    return {
      error: 'Service temporarily unavailable',
      message: 'Unable to generate recommendations at this time. Please try again later.',
    };
  }
}

/**
 * Core product interface representing a product in the catalog
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  imageUrl?: string; // Keep for backward compatibility
  category?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
}

/**
 * Recommendation interface for AI-generated product suggestions
 */
export interface Recommendation {
  name: string;
  reason: string;
  price?: number;
  image?: string;
}

/**
 * API response type for successful recommendation requests
 */
export interface RecommendationResponse {
  recommendations: Recommendation[];
}

/**
 * API error response type for handling API failures
 */
export interface APIError {
  error: string;
  message?: string;
}

/**
 * Generic API response wrapper that can contain either data or error
 */
export type APIResponse<T> = T | APIError;

/**
 * Type guard to check if an API response is an error
 */
export function isAPIError(response: unknown): response is APIError {
  return response != null && 
         typeof response === 'object' && 
         'error' in response && 
         typeof (response as APIError).error === 'string';
}

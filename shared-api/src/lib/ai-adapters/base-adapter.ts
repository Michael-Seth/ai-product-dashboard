/**
 * Base AI Adapter Implementation
 * 
 * This module provides the base implementation for AI adapters,
 * including common functionality and error handling.
 */

import {
  AIAdapter,
  AIProviderConfig,
  AIProvider,
  Product,
  Recommendation,
  RecommendationResponse,
  APIError,
  AIAdapterError
} from '@ai-product-dashboard/shared-types';

/**
 * Base implementation for AI adapters
 */
export abstract class BaseAIAdapter implements AIAdapter {
  protected config: AIProviderConfig | null = null;
  protected lastError: string | null = null;
  protected _isAvailable: boolean = false;

  constructor(public readonly provider: AIProvider) {}

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  /**
   * Initialize the adapter with configuration
   */
  async initialize(config: AIProviderConfig): Promise<void> {
    this.config = config;
    this.lastError = null;
    
    try {
      await this.validateConfig(config);
      await this.setupClient(config);
      this._isAvailable = true;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown initialization error';
      this._isAvailable = false;
      throw error;
    }
  }

  /**
   * Generate product recommendations
   */
  async generateRecommendations(product: Product): Promise<RecommendationResponse | APIError> {
    if (!this.isAvailable || !this.config) {
      return this.createError('Adapter not initialized or unavailable', false);
    }

    try {
      const validationError = this.validateProduct(product);
      if (validationError) {
        return validationError;
      }
      const result = await this.callProvider(product);
      return this.validateAndFormatResponse(result);
      
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      const isRetryable = this.isRetryableError(error);
      
      return this.createError(
        `Failed to generate recommendations: ${this.lastError}`,
        isRetryable
      );
    }
  }

  /**
   * Test if the adapter is working correctly
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isAvailable || !this.config) {
      return false;
    }

    try {
      const testProduct: Product = {
        id: 'test',
        name: 'Test Product',
        description: 'A test product for health check',
        price: 99.99,
        image: 'test.jpg',
        category: 'Test',
        inStock: true,
        rating: 5,
        reviews: 1,
        features: ['Test feature'],
        specifications: { test: 'value' }
      };

      const result = await this.generateRecommendations(testProduct);
      return 'recommendations' in result && Array.isArray(result.recommendations);
      
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Health check failed';
      return false;
    }
  }

  /**
   * Get adapter-specific information
   */
  getInfo() {
    return {
      provider: this.provider,
      model: this.config?.model,
      isAvailable: this.isAvailable,
      lastError: this.lastError
    };
  }

  /**
   * Abstract methods that must be implemented by specific adapters
   */
  protected abstract validateConfig(config: AIProviderConfig): Promise<void>;
  protected abstract setupClient(config: AIProviderConfig): Promise<void>;
  protected abstract callProvider(product: Product): Promise<any>;

  /**
   * Validate product input
   */
  protected validateProduct(product: Product): AIAdapterError | null {
    if (!product || typeof product !== 'object') {
      return this.createError('Invalid product data', false);
    }

    if (!product.name || typeof product.name !== 'string' || product.name.trim().length === 0) {
      return this.createError('Product name is required and must be a non-empty string', false);
    }

    return null;
  }

  /**
   * Validate and format the response from the AI provider
   */
  protected validateAndFormatResponse(response: any): RecommendationResponse | AIAdapterError {
    try {
      let recommendations: Recommendation[] = [];

      if (typeof response === 'string') {
        const parsed = JSON.parse(response);
        recommendations = this.extractRecommendations(parsed);
      } else if (typeof response === 'object') {
        recommendations = this.extractRecommendations(response);
      } else {
        return this.createError('Invalid response format from AI provider', true);
      }
      const validRecommendations = recommendations.filter(rec => 
        rec && 
        typeof rec === 'object' &&
        rec.name && 
        rec.reason &&
        typeof rec.name === 'string' &&
        typeof rec.reason === 'string' &&
        rec.name.trim().length > 0 &&
        rec.reason.trim().length > 0
      ).map(rec => ({
        name: rec.name.trim(),
        reason: rec.reason.trim()
      }));

      if (validRecommendations.length === 0) {
        return this.createError('No valid recommendations received from AI provider', true);
      }

      return { recommendations: validRecommendations };

    } catch (error) {
      return this.createError(
        `Failed to parse AI provider response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      );
    }
  }

  /**
   * Extract recommendations from various response formats
   */
  protected extractRecommendations(response: any): Recommendation[] {
    if (response.recommendations && Array.isArray(response.recommendations)) {
      return response.recommendations;
    }
    
    if (response.choices && Array.isArray(response.choices)) {
      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return parsed.recommendations || [];
        } catch {
          return [];
        }
      }
    }
    
    if (response.content && Array.isArray(response.content)) {
      const textContent = response.content.find((c: any) => c.type === 'text')?.text;
      if (textContent) {
        try {
          const parsed = JSON.parse(textContent);
          return parsed.recommendations || [];
        } catch {
          return [];
        }
      }
    }
    
    if (response.candidates && Array.isArray(response.candidates)) {
      const content = response.candidates[0]?.content?.parts?.[0]?.text;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return parsed.recommendations || [];
        } catch {
          return [];
        }
      }
    }

    return [];
  }

  /**
   * Determine if an error is retryable
   */
  protected isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('network') || 
          message.includes('timeout') || 
          message.includes('enotfound') ||
          message.includes('econnrefused') ||
          message.includes('fetch')) {
        return true;
      }
      if (message.includes('rate limit') || 
          message.includes('429') ||
          message.includes('quota')) {
        return true;
      }
      if (message.includes('500') || 
          message.includes('502') ||
          message.includes('503') ||
          message.includes('504')) {
        return true;
      }
      if (message.includes('auth') || 
          message.includes('401') ||
          message.includes('403') ||
          message.includes('api key')) {
        return false;
      }
    }
    
    return false;
  }

  /**
   * Create a standardized error response
   */
  protected createError(message: string, retryable: boolean): AIAdapterError {
    return {
      error: 'AI Adapter Error',
      message,
      provider: this.provider,
      retryable
    };
  }

  /**
   * Create the standard prompt for product recommendations
   */
  protected createPrompt(product: Product): string {
    return `You are a product recommendation expert. Given the following product, suggest 3-4 related or complementary products that a customer might be interested in.

Product: ${product.name}
Description: ${product.description || 'No description available'}
Price: ${product.price || 'Price not specified'}
Category: ${product.category || 'Not specified'}

Please respond with a JSON object containing an array of recommendations. Each recommendation should have:
- name: The product name
- reason: A brief explanation (1-2 sentences) of why this product complements or relates to the original

Format your response as valid JSON:
{
  "recommendations": [
    {"name": "Product Name", "reason": "Brief explanation"},
    {"name": "Another Product", "reason": "Another brief explanation"},
    {"name": "Third Product", "reason": "Third brief explanation"}
  ]
}

Important: Respond ONLY with the JSON object, no additional text or formatting.`;
  }

  /**
   * Create a timeout promise for requests
   */
  protected createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }
}
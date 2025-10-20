/**
 * OpenAI Adapter Implementation
 * 
 * This module provides the OpenAI-specific implementation of the AI adapter.
 */

import OpenAI from 'openai';
import {
  AIProviderConfig,
  OpenAIConfig,
  Product
} from '@ai-product-dashboard/shared-types';
import { BaseAIAdapter } from './base-adapter';

/**
 * OpenAI adapter implementation
 */
export class OpenAIAdapter extends BaseAIAdapter {
  private client: OpenAI | null = null;

  constructor() {
    super('openai');
  }

  /**
   * Validate OpenAI-specific configuration
   */
  protected async validateConfig(config: AIProviderConfig): Promise<void> {
    if (config.provider !== 'openai') {
      throw new Error('Invalid provider for OpenAI adapter');
    }

    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    const validModels = ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
    if (config.model && !validModels.includes(config.model)) {
      console.warn(`Unknown OpenAI model: ${config.model}. Using default.`);
    }
  }

  /**
   * Setup OpenAI client
   */
  protected async setupClient(config: AIProviderConfig): Promise<void> {
    const openaiConfig = config as OpenAIConfig;
    
    try {
      this.client = new OpenAI({
        apiKey: openaiConfig.apiKey,
        organization: openaiConfig.organization,
        baseURL: openaiConfig.baseUrl,
      });
      await this.testConnection();
      
    } catch (error) {
      this.client = null;
      throw new Error(`Failed to setup OpenAI client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test the OpenAI connection
   */
  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      await Promise.race([
        this.client.models.list(),
        this.createTimeoutPromise(5000)
      ]);
    } catch (error) {
      throw new Error(`OpenAI connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call OpenAI API to generate recommendations
   */
  protected async callProvider(product: Product): Promise<any> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = this.createPrompt(product);
    const model = this.config.model || 'gpt-4o-mini';
    const maxTokens = this.config.maxTokens || 500;
    const temperature = this.config.temperature || 0.7;
    const timeout = this.config.timeout || 10000;

    try {
      const completion = await Promise.race([
        this.client.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful product recommendation assistant. Always respond with valid JSON in the exact format requested. Do not include any additional text or formatting outside the JSON object.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature,
          response_format: { type: 'json_object' } // Ensure JSON response
        }),
        this.createTimeoutPromise(timeout)
      ]);

      return completion;

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('rate_limit_exceeded')) {
          throw new Error('OpenAI rate limit exceeded. Please try again later.');
        }
        
        if (error.message.includes('insufficient_quota')) {
          throw new Error('OpenAI quota exceeded. Please check your billing.');
        }
        
        if (error.message.includes('invalid_api_key')) {
          throw new Error('Invalid OpenAI API key.');
        }
        
        if (error.message.includes('model_not_found')) {
          throw new Error(`OpenAI model '${model}' not found or not accessible.`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Extract recommendations from OpenAI response
   */
  protected extractRecommendations(response: any): any[] {
    if (response.choices && Array.isArray(response.choices)) {
      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return parsed.recommendations || [];
        } catch (parseError) {
          console.warn('Failed to parse OpenAI response as JSON:', content);
          return [];
        }
      }
    }
    
    return super.extractRecommendations(response);
  }

  /**
   * Get OpenAI-specific information
   */
  getInfo() {
    const baseInfo = super.getInfo();
    return {
      ...baseInfo,
      model: this.config?.model || 'gpt-4o-mini',
      organization: (this.config as OpenAIConfig)?.organization,
      supportsJsonMode: true,
      supportsStreaming: true
    };
  }
}
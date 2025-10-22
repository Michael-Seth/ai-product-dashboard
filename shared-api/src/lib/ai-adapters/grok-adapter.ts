/**
 * Grok (X.AI) Adapter Implementation
 * 
 * This module provides the Grok-specific implementation of the AI adapter.
 * Grok uses an OpenAI-compatible API, so we can reuse much of the OpenAI logic.
 */

import OpenAI from 'openai';
import {
  AIProviderConfig,
  GrokConfig,
  Product
} from '@ai-product-dashboard/shared-types';
import { BaseAIAdapter } from './base-adapter';

/**
 * Grok adapter implementation
 */
export class GrokAdapter extends BaseAIAdapter {
  private client: OpenAI | null = null;

  constructor() {
    super('grok');
  }

  /**
   * Validate Grok-specific configuration
   */
  protected async validateConfig(config: AIProviderConfig): Promise<void> {
    if (config.provider !== 'grok') {
      throw new Error('Invalid provider for Grok adapter');
    }

    if (!config.apiKey) {
      throw new Error('Grok API key is required');
    }
    const validModels = ['grok-beta', 'grok-1', 'grok-2'];
    if (config.model && !validModels.includes(config.model)) {
      console.warn(`Unknown Grok model: ${config.model}. Using default.`);
    }
  }

  /**
   * Setup Grok client (uses OpenAI-compatible API)
   */
  protected async setupClient(config: AIProviderConfig): Promise<void> {
    const grokConfig = config as GrokConfig;
    
    try {
      this.client = new OpenAI({
        apiKey: grokConfig.apiKey,
        baseURL: grokConfig.baseUrl || 'https://api.x.ai/v1',
      });
      await this.testConnection();
      
    } catch (error) {
      this.client = null;
      throw new Error(`Failed to setup Grok client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test the Grok connection
   */
  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Grok client not initialized');
    }

    try {
      await Promise.race([
        this.client.chat.completions.create({
          model: 'grok-beta',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1
        }),
        this.createTimeoutPromise(10000)
      ]);
    } catch (error) {
      console.warn('Grok connection test warning:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Call Grok API to generate recommendations
   */
  protected async callProvider(product: Product): Promise<any> {
    if (!this.client || !this.config) {
      throw new Error('Grok client not initialized');
    }

    const prompt = this.createPrompt(product);
    const model = this.config.model || 'grok-beta';
    const maxTokens = this.config.maxTokens || 500;
    const temperature = this.config.temperature || 0.7;
    const timeout = this.config.timeout || 15000; // Grok might be slower

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
        }),
        this.createTimeoutPromise(timeout)
      ]);

      return completion;

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('rate_limit_exceeded') || error.message.includes('429')) {
          throw new Error('Grok rate limit exceeded. Please try again later.');
        }
        
        if (error.message.includes('insufficient_quota') || error.message.includes('quota')) {
          throw new Error('Grok quota exceeded. Please check your billing.');
        }
        
        if (error.message.includes('invalid_api_key') || error.message.includes('401')) {
          throw new Error('Invalid Grok API key.');
        }
        
        if (error.message.includes('model_not_found') || error.message.includes('404')) {
          throw new Error(`Grok model '${model}' not found or not accessible.`);
        }

        if (error.message.includes('timeout')) {
          throw new Error('Grok request timed out. The service might be busy.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Extract recommendations from Grok response
   */
  protected extractRecommendations(response: any): any[] {
    if (response.choices && Array.isArray(response.choices)) {
      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const cleanContent = this.cleanJsonResponse(content);
          const parsed = JSON.parse(cleanContent);
          return parsed.recommendations || [];
        } catch (parseError) {
          console.warn('Failed to parse Grok response as JSON:', content);
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              return parsed.recommendations || [];
            } catch {
              return [];
            }
          }
          return [];
        }
      }
    }
    
    return super.extractRecommendations(response);
  }

  /**
   * Clean JSON response from potential formatting issues
   */
  private cleanJsonResponse(content: string): string {
    // Remove markdown code blocks if present
    let cleaned = content.replace(/```json\s*|\s*```/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If the response starts with text before JSON, try to extract just the JSON
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    
    return cleaned;
  }

  /**
   * Get Grok-specific information
   */
  getInfo() {
    const baseInfo = super.getInfo();
    return {
      ...baseInfo,
      model: this.config?.model || 'grok-beta',
      baseUrl: (this.config as GrokConfig)?.baseUrl || 'https://api.x.ai/v1',
      supportsJsonMode: false, // Grok might not support structured output yet
      supportsStreaming: true,
      provider: 'X.AI Grok'
    };
  }
}
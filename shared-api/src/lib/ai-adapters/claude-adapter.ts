/**
 * Claude (Anthropic) Adapter Implementation
 * 
 * This module provides the Claude-specific implementation of the AI adapter.
 */

import {
  AIProviderConfig,
  ClaudeConfig,
  Product
} from '@ai-product-dashboard/shared-types';
import { BaseAIAdapter } from './base-adapter';

/**
 * Claude adapter implementation
 */
export class ClaudeAdapter extends BaseAIAdapter {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor() {
    super('claude');
  }

  /**
   * Validate Claude-specific configuration
   */
  protected async validateConfig(config: AIProviderConfig): Promise<void> {
    if (config.provider !== 'claude') {
      throw new Error('Invalid provider for Claude adapter');
    }

    if (!config.apiKey) {
      throw new Error('Claude API key is required');
    }
    const validModels = [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229', 
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022'
    ];
    if (config.model && !validModels.includes(config.model)) {
      console.warn(`Unknown Claude model: ${config.model}. Using default.`);
    }
  }

  /**
   * Setup Claude client
   */
  protected async setupClient(config: AIProviderConfig): Promise<void> {
    const claudeConfig = config as ClaudeConfig;
    
    this.apiKey = claudeConfig.apiKey!;
    this.baseUrl = claudeConfig.baseUrl || 'https://api.anthropic.com/v1/messages';
    await this.testConnection();
  }

  /**
   * Test the Claude connection
   */
  private async testConnection(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Claude API key not set');
    }

    try {
      const response = await Promise.race([
        fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        }),
        this.createTimeoutPromise(10000)
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API test failed: ${response.status} ${errorText}`);
      }

    } catch (error) {
      throw new Error(`Claude connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call Claude API to generate recommendations
   */
  protected async callProvider(product: Product): Promise<any> {
    if (!this.apiKey || !this.config) {
      throw new Error('Claude client not initialized');
    }

    const prompt = this.createPrompt(product);
    const model = this.config.model || 'claude-3-haiku-20240307';
    const maxTokens = this.config.maxTokens || 500;
    const temperature = this.config.temperature || 0.7;
    const timeout = this.config.timeout || 12000;

    try {
      const response = await Promise.race([
        fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            temperature,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        }),
        this.createTimeoutPromise(timeout)
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('Invalid Claude API key.');
        } else if (response.status === 429) {
          throw new Error('Claude rate limit exceeded. Please try again later.');
        } else if (response.status === 400) {
          throw new Error('Invalid request to Claude API.');
        } else if (response.status >= 500) {
          throw new Error('Claude server error. Please try again later.');
        }
        
        throw new Error(`Claude API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('Network error connecting to Claude API.');
        }
        
        if (error.message.includes('timeout')) {
          throw new Error('Claude request timed out. Please try again.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Extract recommendations from Claude response
   */
  protected extractRecommendations(response: any): any[] {
    if (response.content && Array.isArray(response.content)) {
      const textContent = response.content.find((c: any) => c.type === 'text')?.text;
      if (textContent) {
        try {
          const cleanContent = this.cleanJsonResponse(textContent);
          const parsed = JSON.parse(cleanContent);
          return parsed.recommendations || [];
        } catch (parseError) {
          console.warn('Failed to parse Claude response as JSON:', textContent);
          const jsonMatch = textContent.match(/\{[\s\S]*\}/);
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
   * Get Claude-specific information
   */
  getInfo() {
    const baseInfo = super.getInfo();
    return {
      ...baseInfo,
      model: this.config?.model || 'claude-3-haiku-20240307',
      baseUrl: this.baseUrl,
      supportsJsonMode: false, // Claude doesn't have structured output mode
      supportsStreaming: true,
      provider: 'Anthropic Claude'
    };
  }
}
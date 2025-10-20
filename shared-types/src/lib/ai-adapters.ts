/**
 * AI Adapter Types and Interfaces
 * 
 * This module defines the interfaces and types for the AI adapter system,
 * allowing the application to work with multiple AI providers.
 */

import { Product, Recommendation, RecommendationResponse, APIError } from './shared-types';

/**
 * Supported AI providers
 */
export type AIProvider = 
  | 'openai' 
  | 'grok' 
  | 'claude' 
  | 'gemini' 
  | 'cohere' 
  | 'huggingface' 
  | 'mock';

/**
 * AI provider configuration
 */
export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  enabled?: boolean;
}

/**
 * AI adapter interface that all providers must implement
 */
export interface AIAdapter {
  readonly provider: AIProvider;
  readonly isAvailable: boolean;
  
  /**
   * Initialize the adapter with configuration
   */
  initialize(config: AIProviderConfig): Promise<void>;
  
  /**
   * Generate product recommendations
   */
  generateRecommendations(product: Product): Promise<RecommendationResponse | APIError>;
  
  /**
   * Test if the adapter is working correctly
   */
  healthCheck(): Promise<boolean>;
  
  /**
   * Get adapter-specific information
   */
  getInfo(): {
    provider: AIProvider;
    model?: string;
    isAvailable: boolean;
    lastError?: string;
  };
}

/**
 * AI adapter manager configuration
 */
export interface AIAdapterManagerConfig {
  primaryProvider: AIProvider;
  fallbackProviders: AIProvider[];
  providers: Record<AIProvider, AIProviderConfig>;
  enableFallback: boolean;
  maxRetries: number;
  retryDelay: number;
}

/**
 * AI adapter manager interface
 */
export interface AIAdapterManager {
  /**
   * Initialize the manager with configuration
   */
  initialize(config: AIAdapterManagerConfig): Promise<void>;
  
  /**
   * Generate recommendations using the best available provider
   */
  generateRecommendations(product: Product): Promise<RecommendationResponse | APIError>;
  
  /**
   * Get the currently active provider
   */
  getActiveProvider(): AIProvider | null;
  
  /**
   * Get all available providers
   */
  getAvailableProviders(): AIProvider[];
  
  /**
   * Switch to a specific provider
   */
  switchProvider(provider: AIProvider): Promise<boolean>;
  
  /**
   * Get health status of all providers
   */
  getHealthStatus(): Promise<Record<AIProvider, boolean>>;
}

/**
 * OpenAI specific configuration
 */
export interface OpenAIConfig extends AIProviderConfig {
  provider: 'openai';
  model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
  organization?: string;
}

/**
 * Grok (X.AI) specific configuration
 */
export interface GrokConfig extends AIProviderConfig {
  provider: 'grok';
  model?: 'grok-beta' | 'grok-1' | 'grok-2';
}

/**
 * Claude (Anthropic) specific configuration
 */
export interface ClaudeConfig extends AIProviderConfig {
  provider: 'claude';
  model?: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';
  version?: string;
}

/**
 * Gemini (Google) specific configuration
 */
export interface GeminiConfig extends AIProviderConfig {
  provider: 'gemini';
  model?: 'gemini-pro' | 'gemini-pro-vision' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
}

/**
 * Cohere specific configuration
 */
export interface CohereConfig extends AIProviderConfig {
  provider: 'cohere';
  model?: 'command' | 'command-light' | 'command-nightly';
}

/**
 * Hugging Face specific configuration
 */
export interface HuggingFaceConfig extends AIProviderConfig {
  provider: 'huggingface';
  model?: string; // Custom model name
  endpoint?: string;
}

/**
 * Mock provider configuration (for testing and fallback)
 */
export interface MockConfig extends AIProviderConfig {
  provider: 'mock';
  responseDelay?: number;
  failureRate?: number;
}

/**
 * Union type for all provider configurations
 */
export type ProviderConfig = 
  | OpenAIConfig 
  | GrokConfig 
  | ClaudeConfig 
  | GeminiConfig 
  | CohereConfig 
  | HuggingFaceConfig 
  | MockConfig;

/**
 * AI adapter factory interface
 */
export interface AIAdapterFactory {
  createAdapter(provider: AIProvider): AIAdapter;
  getSupportedProviders(): AIProvider[];
}

/**
 * Error types specific to AI adapters
 */
export interface AIAdapterError extends APIError {
  provider: AIProvider;
  retryable: boolean;
  code?: string;
}

/**
 * AI adapter events
 */
export type AIAdapterEvent = 
  | 'provider-switched'
  | 'provider-failed'
  | 'provider-recovered'
  | 'fallback-activated'
  | 'all-providers-failed';

/**
 * AI adapter event listener
 */
export interface AIAdapterEventListener {
  (event: AIAdapterEvent, data: any): void;
}

/**
 * Default configurations for each provider
 */
export const DEFAULT_PROVIDER_CONFIGS: Record<AIProvider, Partial<AIProviderConfig>> = {
  openai: {
    model: 'gpt-4o-mini',
    maxTokens: 500,
    temperature: 0.7,
    timeout: 10000,
  },
  grok: {
    model: 'grok-beta',
    maxTokens: 500,
    temperature: 0.7,
    timeout: 15000,
  },
  claude: {
    model: 'claude-3-haiku-20240307',
    maxTokens: 500,
    temperature: 0.7,
    timeout: 12000,
  },
  gemini: {
    model: 'gemini-1.5-flash',
    maxTokens: 500,
    temperature: 0.7,
    timeout: 10000,
  },
  cohere: {
    model: 'command-light',
    maxTokens: 500,
    temperature: 0.7,
    timeout: 10000,
  },
  huggingface: {
    model: 'microsoft/DialoGPT-medium',
    maxTokens: 500,
    temperature: 0.7,
    timeout: 15000,
  },
  mock: {
    maxTokens: 500,
    temperature: 0.7,
    timeout: 1000,
  },
};
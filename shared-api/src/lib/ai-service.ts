/**
 * AI Service
 * 
 * This module provides a high-level AI service that uses the adapter system
 * while maintaining backward compatibility with the existing API.
 */

import {
  Product,
  Recommendation,
  RecommendationResponse,
  APIError,
  AIProvider,
  AIAdapterManagerConfig,
  DEFAULT_PROVIDER_CONFIGS
} from '@ai-product-dashboard/shared-types';

import { AIAdapterManagerImpl } from './ai-adapters/adapter-manager';

/**
 * AI Service configuration
 */
export interface AIServiceConfig {
  primaryProvider?: AIProvider;
  fallbackProviders?: AIProvider[];
  enableFallback?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  providers?: {
    openai?: {
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    };
    grok?: {
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    };
    claude?: {
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    };
    [key: string]: any;
  };
}

/**
 * AI Service class
 */
export class AIService {
  private adapterManager: AIAdapterManagerImpl;
  private initialized: boolean = false;

  constructor() {
    this.adapterManager = new AIAdapterManagerImpl();
  }

  /**
   * Initialize the AI service with configuration
   */
  async initialize(config: AIServiceConfig = {}): Promise<void> {
    const managerConfig: AIAdapterManagerConfig = {
      primaryProvider: config.primaryProvider || 'openai',
      fallbackProviders: config.fallbackProviders || ['mock'],
      enableFallback: config.enableFallback !== false,
      maxRetries: config.maxRetries || 2,
      retryDelay: config.retryDelay || 1000,
      providers: this.buildProviderConfigs(config)
    };

    await this.adapterManager.initialize(managerConfig);
    this.initialized = true;
  }

  /**
   * Generate product recommendations
   */
  async generateRecommendations(product: Product): Promise<RecommendationResponse | APIError> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.adapterManager.generateRecommendations(product);
  }

  /**
   * Get the currently active AI provider
   */
  getActiveProvider(): AIProvider | null {
    return this.adapterManager.getActiveProvider();
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): AIProvider[] {
    return this.adapterManager.getAvailableProviders();
  }

  /**
   * Switch to a specific provider
   */
  async switchProvider(provider: AIProvider): Promise<boolean> {
    return this.adapterManager.switchProvider(provider);
  }

  /**
   * Get health status of all providers
   */
  async getHealthStatus(): Promise<Record<AIProvider, boolean>> {
    return this.adapterManager.getHealthStatus();
  }

  /**
   * Get detailed information about all adapters
   */
  getAdapterInfo(): Record<AIProvider, any> {
    return this.adapterManager.getAdapterInfo();
  }

  /**
   * Build provider configurations from service config
   */
  private buildProviderConfigs(config: AIServiceConfig): AIAdapterManagerConfig['providers'] {
    const providers: AIAdapterManagerConfig['providers'] = {} as AIAdapterManagerConfig['providers'];
    providers.openai = {
      provider: 'openai',
      ...DEFAULT_PROVIDER_CONFIGS.openai,
      apiKey: config.providers?.openai?.apiKey || 
              process.env['OPENAI_API_KEY'] || 
              process.env['VITE_OPENAI_API_KEY'],
      model: config.providers?.openai?.model,
      baseUrl: config.providers?.openai?.baseUrl,
      enabled: !!config.providers?.openai?.apiKey || 
               !!process.env['OPENAI_API_KEY'] || 
               !!process.env['VITE_OPENAI_API_KEY']
    };
    providers.grok = {
      provider: 'grok',
      ...DEFAULT_PROVIDER_CONFIGS.grok,
      apiKey: config.providers?.grok?.apiKey || 
              process.env['GROK_API_KEY'] || 
              process.env['XAI_API_KEY'],
      model: config.providers?.grok?.model,
      baseUrl: config.providers?.grok?.baseUrl || 'https://api.x.ai/v1',
      enabled: !!config.providers?.grok?.apiKey || 
               !!process.env['GROK_API_KEY'] || 
               !!process.env['XAI_API_KEY']
    };
    providers.claude = {
      provider: 'claude',
      ...DEFAULT_PROVIDER_CONFIGS.claude,
      apiKey: config.providers?.claude?.apiKey || 
              process.env['CLAUDE_API_KEY'] || 
              process.env['ANTHROPIC_API_KEY'],
      model: config.providers?.claude?.model,
      baseUrl: config.providers?.claude?.baseUrl,
      enabled: !!config.providers?.claude?.apiKey || 
               !!process.env['CLAUDE_API_KEY'] || 
               !!process.env['ANTHROPIC_API_KEY']
    };
    providers.gemini = {
      provider: 'gemini',
      ...DEFAULT_PROVIDER_CONFIGS.gemini,
      apiKey: process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'],
      enabled: false // Not implemented yet
    };
    providers.cohere = {
      provider: 'cohere',
      ...DEFAULT_PROVIDER_CONFIGS.cohere,
      apiKey: process.env['COHERE_API_KEY'],
      enabled: false // Not implemented yet
    };
    providers.huggingface = {
      provider: 'huggingface',
      ...DEFAULT_PROVIDER_CONFIGS.huggingface,
      apiKey: process.env['HUGGINGFACE_API_KEY'],
      enabled: false // Not implemented yet
    };
    providers.mock = {
      provider: 'mock',
      ...DEFAULT_PROVIDER_CONFIGS.mock,
      enabled: true
    };

    return providers;
  }
}
let globalAIService: AIService | null = null;

/**
 * Get the global AI service instance
 */
export function getAIService(): AIService {
  if (!globalAIService) {
    globalAIService = new AIService();
  }
  return globalAIService;
}

/**
 * Initialize the global AI service
 */
export async function initializeAIService(config?: AIServiceConfig): Promise<void> {
  const service = getAIService();
  await service.initialize(config);
}

/**
 * Backward compatibility function - maintains the original API
 */
export async function recommendProducts(product: Product): Promise<RecommendationResponse | APIError> {
  const service = getAIService();
  return service.generateRecommendations(product);
}

/**
 * Mock recommendation function for backward compatibility
 */
export function mockRecommend(productName: string): Recommendation[] {
  if (!productName || typeof productName !== 'string') {
    console.warn('Invalid product name for mock recommendations, using default');
    productName = 'Generic Product';
  }

  const mockRecommendations: Record<string, Recommendation[]> = {
    'MacBook Air': [
      {
        name: 'MacBook Pro',
        reason: 'More powerful processor and better graphics for demanding tasks',
      },
      {
        name: 'iPad Pro',
        reason: 'Portable alternative with touch interface and Apple Pencil support',
      },
      {
        name: 'Magic Mouse',
        reason: 'Perfect wireless mouse companion for your MacBook setup',
      },
      {
        name: 'USB-C Hub',
        reason: 'Expand connectivity with multiple ports for peripherals',
      },
    ],
    'Dell XPS 13': [
      {
        name: 'Dell XPS 15',
        reason: 'Larger screen and more powerful specs for enhanced productivity',
      },
      {
        name: 'Dell Wireless Mouse',
        reason: 'Ergonomic wireless mouse designed for Dell laptops',
      },
      {
        name: 'Dell Monitor',
        reason: 'External monitor to create a dual-screen workspace',
      },
      {
        name: 'Laptop Stand',
        reason: 'Improve ergonomics and cooling with an adjustable stand',
      },
    ],
    'ThinkPad X1 Carbon': [
      {
        name: 'ThinkPad Docking Station',
        reason: 'One-cable solution for connecting multiple peripherals',
      },
      {
        name: 'Lenovo Wireless Keyboard',
        reason: 'Full-size keyboard for comfortable extended typing',
      },
      {
        name: 'ThinkPad Travel Mouse',
        reason: 'Compact mouse designed for business professionals',
      },
      {
        name: 'Laptop Bag',
        reason: 'Professional carrying case designed for ThinkPad laptops',
      },
    ],
  };

  return mockRecommendations[productName] || [
    {
      name: 'Laptop Stand',
      reason: 'Improve ergonomics and airflow for any laptop',
    },
    {
      name: 'Wireless Mouse',
      reason: 'Enhanced productivity with precise cursor control',
    },
    {
      name: 'External Monitor',
      reason: 'Expand your workspace with a larger display',
    },
    {
      name: 'USB-C Charger',
      reason: 'Backup power solution for mobile productivity',
    },
  ];
}
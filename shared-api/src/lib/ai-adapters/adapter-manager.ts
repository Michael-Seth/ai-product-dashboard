/**
 * AI Adapter Manager
 * 
 * This module manages multiple AI adapters, handles fallbacks,
 * and provides a unified interface for AI recommendations.
 */

import {
  AIAdapter,
  AIAdapterManager,
  AIAdapterManagerConfig,
  AIProvider,
  Product,
  RecommendationResponse,
  APIError,
  AIAdapterError,
  AIAdapterEvent,
  AIAdapterEventListener,
  DEFAULT_PROVIDER_CONFIGS
} from '@ai-product-dashboard/shared-types';

import { OpenAIAdapter } from './openai-adapter';
import { GrokAdapter } from './grok-adapter';
import { ClaudeAdapter } from './claude-adapter';
import { MockAdapter } from './mock-adapter';

/**
 * AI Adapter Manager implementation
 */
export class AIAdapterManagerImpl implements AIAdapterManager {
  private adapters: Map<AIProvider, AIAdapter> = new Map();
  private config: AIAdapterManagerConfig | null = null;
  private activeProvider: AIProvider | null = null;
  private eventListeners: AIAdapterEventListener[] = [];
  private healthStatus: Map<AIProvider, boolean> = new Map();
  private lastHealthCheck: Map<AIProvider, number> = new Map();
  private readonly healthCheckInterval = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize the manager with configuration
   */
  async initialize(config: AIAdapterManagerConfig): Promise<void> {
    this.config = config;
    await this.createAdapters();
    await this.initializeAdapters();
    await this.setActiveProvider();
    this.startHealthMonitoring();
  }

  /**
   * Generate recommendations using the best available provider
   */
  async generateRecommendations(product: Product): Promise<RecommendationResponse | APIError> {
    if (!this.config) {
      return {
        error: 'Adapter manager not initialized',
        message: 'Please initialize the adapter manager before use'
      };
    }
    if (this.activeProvider) {
      const result = await this.tryProvider(this.activeProvider, product);
      if ('recommendations' in result) {
        return result;
      }
      this.emitEvent('provider-failed', { provider: this.activeProvider, error: result });
    }
    if (this.config.enableFallback) {
      for (const provider of this.config.fallbackProviders) {
        if (provider === this.activeProvider) continue; // Skip already tried provider
        
        const result = await this.tryProvider(provider, product);
        if ('recommendations' in result) {
          this.activeProvider = provider;
          this.emitEvent('fallback-activated', { provider });
          return result;
        }
      }
    }
    this.emitEvent('all-providers-failed', {});
    
    return {
      error: 'All AI providers failed',
      message: 'Unable to generate recommendations at this time. Please try again later.'
    };
  }

  /**
   * Try a specific provider with retries
   */
  private async tryProvider(provider: AIProvider, product: Product, retryCount = 0): Promise<RecommendationResponse | APIError> {
    const adapter = this.adapters.get(provider);
    if (!adapter || !adapter.isAvailable) {
      return {
        error: 'Provider unavailable',
        message: `${provider} provider is not available`
      };
    }

    try {
      const result = await adapter.generateRecommendations(product);
      
      if ('recommendations' in result) {
        this.healthStatus.set(provider, true);
        this.lastHealthCheck.set(provider, Date.now());
        return result;
      }
      const adapterError = result as AIAdapterError;
      if (adapterError.retryable && retryCount < this.config!.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.config!.retryDelay));
        return this.tryProvider(provider, product, retryCount + 1);
      }
      this.healthStatus.set(provider, false);
      return result;
      
    } catch (error) {
      this.healthStatus.set(provider, false);
      
      return {
        error: 'Provider error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get the currently active provider
   */
  getActiveProvider(): AIProvider | null {
    return this.activeProvider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.adapters.keys()).filter(provider => {
      const adapter = this.adapters.get(provider);
      return adapter?.isAvailable || false;
    });
  }

  /**
   * Switch to a specific provider
   */
  async switchProvider(provider: AIProvider): Promise<boolean> {
    const adapter = this.adapters.get(provider);
    if (!adapter || !adapter.isAvailable) {
      return false;
    }

    const oldProvider = this.activeProvider;
    this.activeProvider = provider;
    const isHealthy = await adapter.healthCheck();
    if (isHealthy) {
      this.healthStatus.set(provider, true);
      this.emitEvent('provider-switched', { from: oldProvider, to: provider });
      return true;
    } else {
      this.activeProvider = oldProvider;
      this.healthStatus.set(provider, false);
      return false;
    }
  }

  /**
   * Get health status of all providers
   */
  async getHealthStatus(): Promise<Record<AIProvider, boolean>> {
    const status: Record<AIProvider, boolean> = {} as Record<AIProvider, boolean>;
    
    for (const [provider, adapter] of this.adapters) {
      const lastCheck = this.lastHealthCheck.get(provider) || 0;
      const now = Date.now();
      
      if (now - lastCheck < this.healthCheckInterval) {
        status[provider] = this.healthStatus.get(provider) || false;
      } else {
        const isHealthy = await adapter.healthCheck();
        this.healthStatus.set(provider, isHealthy);
        this.lastHealthCheck.set(provider, now);
        status[provider] = isHealthy;
      }
    }
    
    return status;
  }

  /**
   * Add event listener
   */
  addEventListener(listener: AIAdapterEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: AIAdapterEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Create adapters for all configured providers
   */
  private async createAdapters(): Promise<void> {
    const adapterFactories: Record<AIProvider, () => AIAdapter> = {
      openai: () => new OpenAIAdapter(),
      grok: () => new GrokAdapter(),
      claude: () => new ClaudeAdapter(),
      gemini: () => new MockAdapter(), // TODO: Implement Gemini adapter
      cohere: () => new MockAdapter(), // TODO: Implement Cohere adapter
      huggingface: () => new MockAdapter(), // TODO: Implement HuggingFace adapter
      mock: () => new MockAdapter()
    };

    for (const provider of Object.keys(this.config!.providers) as AIProvider[]) {
      const factory = adapterFactories[provider];
      if (factory) {
        this.adapters.set(provider, factory());
      }
    }
  }

  /**
   * Initialize all adapters
   */
  private async initializeAdapters(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    for (const [provider, adapter] of this.adapters) {
      const providerConfig = this.config!.providers[provider];
      if (providerConfig && providerConfig.enabled !== false) {
        const mergedConfig = {
          ...DEFAULT_PROVIDER_CONFIGS[provider],
          ...providerConfig
        };

        initPromises.push(
          adapter.initialize(mergedConfig).catch(error => {
            console.warn(`Failed to initialize ${provider} adapter:`, error.message);
            this.healthStatus.set(provider, false);
          })
        );
      }
    }

    await Promise.all(initPromises);
  }

  /**
   * Set the active provider based on availability
   */
  private async setActiveProvider(): Promise<void> {
    const primaryAdapter = this.adapters.get(this.config!.primaryProvider);
    if (primaryAdapter?.isAvailable) {
      this.activeProvider = this.config!.primaryProvider;
      this.healthStatus.set(this.config!.primaryProvider, true);
      return;
    }
    for (const provider of this.config!.fallbackProviders) {
      const adapter = this.adapters.get(provider);
      if (adapter?.isAvailable) {
        this.activeProvider = provider;
        this.healthStatus.set(provider, true);
        this.emitEvent('fallback-activated', { provider });
        return;
      }
    }
    this.activeProvider = null;
    console.warn('No AI providers are available');
  }

  /**
   * Start health monitoring for all providers
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckInterval);
  }

  /**
   * Perform health checks on all providers
   */
  private async performHealthChecks(): Promise<void> {
    for (const [provider, adapter] of this.adapters) {
      try {
        const wasHealthy = this.healthStatus.get(provider) || false;
        const isHealthy = await adapter.healthCheck();
        
        this.healthStatus.set(provider, isHealthy);
        this.lastHealthCheck.set(provider, Date.now());
        if (!wasHealthy && isHealthy) {
          this.emitEvent('provider-recovered', { provider });
        } else if (wasHealthy && !isHealthy) {
          this.emitEvent('provider-failed', { provider });
        }
        
      } catch (error) {
        this.healthStatus.set(provider, false);
        console.warn(`Health check failed for ${provider}:`, error);
      }
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emitEvent(event: AIAdapterEvent, data: any): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    }
  }

  /**
   * Get detailed information about all adapters
   */
  getAdapterInfo(): Record<AIProvider, any> {
    const info: Record<AIProvider, any> = {} as Record<AIProvider, any>;
    
    for (const [provider, adapter] of this.adapters) {
      info[provider] = {
        ...adapter.getInfo(),
        isHealthy: this.healthStatus.get(provider) || false,
        lastHealthCheck: this.lastHealthCheck.get(provider) || null
      };
    }
    
    return info;
  }
}
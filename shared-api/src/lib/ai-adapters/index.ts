/**
 * AI Adapters Module
 * 
 * This module exports all AI adapters and the adapter manager,
 * providing a unified interface for AI-powered recommendations.
 */

export { BaseAIAdapter } from './base-adapter';
export { OpenAIAdapter } from './openai-adapter';
export { GrokAdapter } from './grok-adapter';
export { ClaudeAdapter } from './claude-adapter';
export { MockAdapter } from './mock-adapter';
export { AIAdapterManagerImpl } from './adapter-manager';
export * from '@ai-product-dashboard/shared-types';
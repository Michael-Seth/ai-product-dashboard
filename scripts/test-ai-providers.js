#!/usr/bin/env node

/**
 * AI Providers Test Script
 * 
 * This script tests all configured AI providers and shows their status,
 * helping users verify their API keys and configurations.
 * 
 * Usage:
 *   node scripts/test-ai-providers.js [options]
 * 
 * Options:
 *   --provider <name>  Test only a specific provider
 *   --verbose          Show detailed output
 *   --help             Show this help message
 */

const { AIService } = require('../shared-api/src/lib/ai-service');
const { mockRecommend } = require('../shared-api/src/lib/ai-service');

class AIProviderTester {
  constructor(options = {}) {
    this.options = {
      provider: options.provider || null,
      verbose: options.verbose || false,
      ...options
    };
    
    this.aiService = new AIService();
    this.testProduct = {
      id: 'test-1',
      name: 'MacBook Air M2',
      description: 'Apple MacBook Air 13-inch with M2 chip, 8GB RAM, 256GB SSD',
      price: 1199,
      image: 'test-macbook.jpg',
      category: 'Laptops',
      inStock: true,
      rating: 4.8,
      reviews: 1247,
      features: ['M2 Chip', '13-inch Display', 'All-day Battery'],
      specifications: {
        processor: 'Apple M2',
        memory: '8GB',
        storage: '256GB SSD'
      }
    };
  }

  /**
   * Main test runner
   */
  async runTests() {
    try {
      await this.aiService.initialize();
      const availableProviders = this.aiService.getAvailableProviders();
      const activeProvider = this.aiService.getActiveProvider();
      if (this.options.provider) {
        await this.testProvider(this.options.provider);
      } else {
        await this.testAllProviders();
      }
      await this.showSummary();
      
    } catch (error) {
      console.error('❌ Error during testing:', error.message);
      process.exit(1);
    }
  }

  /**
   * Test all available providers
   */
  async testAllProviders() {
    const providers = ['openai', 'grok', 'claude', 'gemini', 'cohere', 'huggingface', 'mock'];
    
    for (const provider of providers) {
      await this.testProvider(provider);
      console.log(''); // Add spacing between tests
    }
  }

  /**
   * Test a specific provider
   */
  async testProvider(providerName) {
    try {
      const availableProviders = this.aiService.getAvailableProviders();
      const isAvailable = availableProviders.includes(providerName);
      
      if (!isAvailable) {
        this.showProviderSetupInstructions(providerName);
        return;
      }
      const switched = await this.aiService.switchProvider(providerName);
      if (!switched) {
        return;
      }
      const healthStatus = await this.aiService.getHealthStatus();
      const isHealthy = healthStatus[providerName];
      
      if (isHealthy) {
      } else {
        return;
      }
      const startTime = Date.now();
      
      const result = await this.aiService.generateRecommendations(this.testProduct);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if ('recommendations' in result) {
        if (this.options.verbose) {
          result.recommendations.slice(0, 2).forEach((rec, index) => {
          });
        }
      } else {
      }
      const adapterInfo = this.aiService.getAdapterInfo();
      const providerInfo = adapterInfo[providerName];
      
      if (providerInfo && this.options.verbose) {
      }
      
    } catch (error) {
      if (this.options.verbose) {
      }
    }
  }

  /**
   * Show setup instructions for a provider
   */
  showProviderSetupInstructions(provider) {
    const instructions = {
      openai: {
        apiKey: 'OPENAI_API_KEY',
        url: 'https://platform.openai.com/api-keys',
        description: 'Get your API key from OpenAI Platform'
      },
      grok: {
        apiKey: 'GROK_API_KEY or XAI_API_KEY',
        url: 'https://console.x.ai/',
        description: 'Get your API key from X.AI Console'
      },
      claude: {
        apiKey: 'CLAUDE_API_KEY or ANTHROPIC_API_KEY',
        url: 'https://console.anthropic.com/',
        description: 'Get your API key from Anthropic Console'
      },
      gemini: {
        apiKey: 'GEMINI_API_KEY or GOOGLE_API_KEY',
        url: 'https://makersuite.google.com/app/apikey',
        description: 'Get your API key from Google AI Studio'
      },
      cohere: {
        apiKey: 'COHERE_API_KEY',
        url: 'https://dashboard.cohere.ai/api-keys',
        description: 'Get your API key from Cohere Dashboard'
      },
      huggingface: {
        apiKey: 'HUGGINGFACE_API_KEY',
        url: 'https://huggingface.co/settings/tokens',
        description: 'Get your API key from Hugging Face'
      }
    };
    
    const info = instructions[provider];
    if (info) {
    }
  }

  /**
   * Show test summary
   */
  async showSummary() {
    const healthStatus = await this.aiService.getHealthStatus();
    const adapterInfo = this.aiService.getAdapterInfo();
    const activeProvider = this.aiService.getActiveProvider();
    for (const [provider, isHealthy] of Object.entries(healthStatus)) {
      const status = isHealthy ? '✅ Healthy' : '❌ Unhealthy';
      const info = adapterInfo[provider];
      const model = info?.model ? ` (${info.model})` : '';
    }
    
    const healthyProviders = Object.values(healthStatus).filter(Boolean).length;
    const totalProviders = Object.keys(healthStatus).length;
    if (healthyProviders === 0) {
    } else if (healthyProviders === 1 && healthStatus.mock) {
    } else {
    }
  }

  /**
   * Show help message
   */
  static showHelp() {
  --verbose          Show detailed output including sample recommendations
  --help             Show this help message

Examples:
  # Test all providers
  node scripts/test-ai-providers.js

  # Test only OpenAI
  node scripts/test-ai-providers.js --provider openai

  # Test with verbose output
  node scripts/test-ai-providers.js --verbose

  # Test Grok provider specifically
  node scripts/test-ai-providers.js --provider grok --verbose

Supported Providers:
  ✅ openai      - OpenAI GPT models
  ✅ grok        - X.AI Grok models
  ✅ claude      - Anthropic Claude models
  🚧 gemini      - Google Gemini models (coming soon)
  🚧 cohere      - Cohere models (coming soon)
  🚧 huggingface - Hugging Face models (coming soon)
  ✅ mock        - Mock provider (always available)

Environment Variables:
  OPENAI_API_KEY     - OpenAI API key
  GROK_API_KEY       - Grok/X.AI API key
  CLAUDE_API_KEY     - Claude/Anthropic API key
  GEMINI_API_KEY     - Gemini/Google API key
  COHERE_API_KEY     - Cohere API key
  HUGGINGFACE_API_KEY - Hugging Face API key

Configuration:
  Check .env.example for complete configuration options.
`);
  }
}
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    provider: null,
    verbose: args.includes('--verbose'),
    help: args.includes('--help') || args.includes('-h')
  };
  const providerIndex = args.indexOf('--provider');
  if (providerIndex !== -1 && args[providerIndex + 1]) {
    options.provider = args[providerIndex + 1];
  }
  
  if (options.help) {
    AIProviderTester.showHelp();
    return;
  }
  
  const tester = new AIProviderTester(options);
  await tester.runTests();
}
module.exports = AIProviderTester;
if (require.main === module) {
  main().catch(console.error);
}
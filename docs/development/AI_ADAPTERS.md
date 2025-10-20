# 🤖 AI Adapters System

The AI Adapters System provides a flexible, extensible way to integrate multiple AI providers for product recommendations. Instead of being limited to OpenAI, the application can now work with Grok, Claude, Gemini, and other AI providers with automatic fallback support.

## 🎯 Overview

The AI Adapters System consists of:

- **Multiple AI Providers**: OpenAI, Grok (X.AI), Claude (Anthropic), and more
- **Automatic Fallback**: If one provider fails, automatically try others
- **Unified Interface**: Same API regardless of which provider is used
- **Health Monitoring**: Continuous monitoring of provider availability
- **Backward Compatibility**: Existing code continues to work unchanged

## 🚀 Quick Start

### 1. Configure API Keys

Add your API keys to the `.env` file:

```bash
# Primary provider (OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# Alternative providers
GROK_API_KEY=your_grok_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# Configuration
AI_PRIMARY_PROVIDER=openai
AI_FALLBACK_PROVIDERS=grok,claude,mock
```

### 2. Test Your Configuration

```bash
# Test all providers
npm run test-ai

# Test specific provider
npm run test-ai:grok

# Verbose output with sample recommendations
npm run test-ai:verbose
```

### 3. Use in Your Code

The existing API continues to work unchanged:

```typescript
import { recommendProducts } from '@ai-product-dashboard/shared-api';

const product = {
  id: '1',
  name: 'MacBook Air M2',
  description: 'Apple MacBook Air with M2 chip',
  price: 1199,
  // ... other product properties
};

const result = await recommendProducts(product);
if ('recommendations' in result) {
  console.log('Recommendations:', result.recommendations);
} else {
  console.error('Error:', result.message);
}
```

## 🔧 Supported Providers

### ✅ **OpenAI** (Fully Supported)
- **Models**: GPT-4, GPT-4 Turbo, GPT-4o, GPT-4o-mini, GPT-3.5 Turbo
- **API Key**: `OPENAI_API_KEY`
- **Features**: JSON mode, streaming, function calling
- **Get API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)

### ✅ **Grok (X.AI)** (Fully Supported)
- **Models**: grok-beta, grok-1, grok-2
- **API Key**: `GROK_API_KEY` or `XAI_API_KEY`
- **Features**: OpenAI-compatible API, streaming
- **Get API Key**: [X.AI Console](https://console.x.ai/)

### ✅ **Claude (Anthropic)** (Fully Supported)
- **Models**: Claude 3 Opus, Sonnet, Haiku
- **API Key**: `CLAUDE_API_KEY` or `ANTHROPIC_API_KEY`
- **Features**: Large context window, safety-focused
- **Get API Key**: [Anthropic Console](https://console.anthropic.com/)

### 🚧 **Gemini (Google)** (Coming Soon)
- **Models**: Gemini Pro, Gemini Pro Vision
- **API Key**: `GEMINI_API_KEY` or `GOOGLE_API_KEY`
- **Status**: Implementation in progress

### 🚧 **Cohere** (Coming Soon)
- **Models**: Command, Command Light
- **API Key**: `COHERE_API_KEY`
- **Status**: Implementation in progress

### ✅ **Mock Provider** (Always Available)
- **Purpose**: Testing and fallback
- **Features**: Contextual recommendations, configurable delays
- **Status**: Always enabled as ultimate fallback

## ⚙️ Configuration

### Environment Variables

```bash
# API Keys
OPENAI_API_KEY=your_openai_api_key
GROK_API_KEY=your_grok_api_key
CLAUDE_API_KEY=your_claude_api_key

# Provider Configuration
AI_PRIMARY_PROVIDER=openai           # Primary provider to use
AI_FALLBACK_PROVIDERS=grok,claude,mock  # Fallback providers (comma-separated)
AI_ENABLE_FALLBACK=true             # Enable automatic fallback
AI_MAX_RETRIES=2                    # Max retries per provider
AI_RETRY_DELAY=1000                 # Delay between retries (ms)

# Model Configuration (Optional)
OPENAI_MODEL=gpt-4o-mini
GROK_MODEL=grok-beta
CLAUDE_MODEL=claude-3-haiku-20240307
```

### Programmatic Configuration

```typescript
import { AIService } from '@ai-product-dashboard/shared-api';

const aiService = new AIService();

await aiService.initialize({
  primaryProvider: 'grok',
  fallbackProviders: ['openai', 'claude', 'mock'],
  enableFallback: true,
  maxRetries: 3,
  retryDelay: 2000,
  providers: {
    grok: {
      apiKey: 'your_grok_api_key',
      model: 'grok-beta'
    },
    openai: {
      apiKey: 'your_openai_api_key',
      model: 'gpt-4o-mini'
    }
  }
});

// Generate recommendations
const result = await aiService.generateRecommendations(product);
```

## 🔄 How Fallback Works

1. **Primary Provider**: Try the configured primary provider first
2. **Automatic Retry**: If it fails with a retryable error, retry up to `maxRetries` times
3. **Fallback Cascade**: If primary fails, try each fallback provider in order
4. **Ultimate Fallback**: If all AI providers fail, use the mock provider
5. **Health Monitoring**: Continuously monitor provider health and switch if needed

```
OpenAI (Primary) → Grok (Fallback 1) → Claude (Fallback 2) → Mock (Ultimate)
```

## 🏥 Health Monitoring

The system continuously monitors provider health:

```typescript
// Check health status
const healthStatus = await aiService.getHealthStatus();
console.log(healthStatus);
// Output: { openai: true, grok: false, claude: true, mock: true }

// Get detailed adapter information
const adapterInfo = aiService.getAdapterInfo();
console.log(adapterInfo.openai);
// Output: { provider: 'openai', model: 'gpt-4o-mini', isAvailable: true, ... }
```

## 🧪 Testing

### Test All Providers

```bash
npm run test-ai
```

### Test Specific Provider

```bash
npm run test-ai:openai
npm run test-ai:grok
npm run test-ai:claude
```

### Verbose Testing

```bash
npm run test-ai:verbose
```

### Example Test Output

```
🧪 AI Providers Test Suite

🔧 Initializing AI service...
✅ AI service initialized

🎯 Active provider: openai
📋 Available providers: openai, grok, mock

🧪 Testing OPENAI provider:
────────────────────────────────────────
✅ Successfully switched to openai
✅ Health check passed
🔄 Generating test recommendations...
✅ Recommendations generated successfully (1247ms)
📊 Generated 4 recommendations

🧪 Testing GROK provider:
────────────────────────────────────────
✅ Successfully switched to grok
✅ Health check passed
🔄 Generating test recommendations...
✅ Recommendations generated successfully (2156ms)
📊 Generated 3 recommendations
```

## 🔧 Advanced Usage

### Manual Provider Switching

```typescript
// Switch to a specific provider
const success = await aiService.switchProvider('grok');
if (success) {
  console.log('Switched to Grok successfully');
}

// Get current active provider
const activeProvider = aiService.getActiveProvider();
console.log(`Currently using: ${activeProvider}`);
```

### Event Monitoring

```typescript
// Listen for provider events
aiService.addEventListener((event, data) => {
  switch (event) {
    case 'provider-switched':
      console.log(`Switched from ${data.from} to ${data.to}`);
      break;
    case 'provider-failed':
      console.log(`Provider ${data.provider} failed:`, data.error);
      break;
    case 'fallback-activated':
      console.log(`Fallback activated: ${data.provider}`);
      break;
    case 'all-providers-failed':
      console.log('All providers failed, using mock');
      break;
  }
});
```

### Custom Adapter Implementation

```typescript
import { BaseAIAdapter } from '@ai-product-dashboard/shared-api';

class CustomAdapter extends BaseAIAdapter {
  constructor() {
    super('custom');
  }

  protected async validateConfig(config) {
    // Validate configuration
  }

  protected async setupClient(config) {
    // Setup your AI client
  }

  protected async callProvider(product) {
    // Call your AI provider
    return {
      recommendations: [
        { name: 'Product 1', reason: 'Reason 1' },
        { name: 'Product 2', reason: 'Reason 2' }
      ]
    };
  }
}
```

## 🚨 Error Handling

The system provides comprehensive error handling:

### Retryable Errors
- Network timeouts
- Rate limiting (429)
- Server errors (500, 502, 503, 504)

### Non-Retryable Errors
- Invalid API keys (401, 403)
- Invalid requests (400)
- Model not found (404)

### Error Response Format

```typescript
interface AIAdapterError {
  error: string;
  message: string;
  provider: AIProvider;
  retryable: boolean;
  code?: string;
}
```

## 📊 Performance Considerations

### Response Times (Typical)
- **OpenAI**: 1-3 seconds
- **Grok**: 2-4 seconds
- **Claude**: 1-3 seconds
- **Mock**: < 1 second

### Optimization Tips
1. **Set appropriate timeouts** for each provider
2. **Use faster models** for better response times (e.g., GPT-4o-mini vs GPT-4)
3. **Configure retries wisely** to balance reliability and speed
4. **Monitor provider health** to avoid slow providers

## 🔒 Security Best Practices

1. **Environment Variables**: Store API keys in environment variables, never in code
2. **Key Rotation**: Regularly rotate API keys
3. **Access Control**: Limit API key permissions where possible
4. **Monitoring**: Monitor API usage for unusual patterns
5. **Fallback Security**: Ensure fallback providers are also secure

## 🐛 Troubleshooting

### Common Issues

**Provider Not Available**
```bash
# Check if API key is set
echo $OPENAI_API_KEY

# Test specific provider
npm run test-ai:openai
```

**All Providers Failing**
```bash
# Check network connectivity
curl -I https://api.openai.com/v1/models

# Test with verbose output
npm run test-ai:verbose
```

**Slow Response Times**
- Check provider status pages
- Try different models
- Adjust timeout settings
- Monitor network latency

### Debug Mode

Enable debug logging:

```bash
DEBUG=ai-adapters npm run dev
```

## 🔮 Future Enhancements

### Planned Features
- **Gemini Integration**: Google's Gemini models
- **Cohere Integration**: Cohere's command models
- **Hugging Face Integration**: Open source models
- **Local Models**: Support for local AI models
- **Caching**: Response caching for better performance
- **Analytics**: Usage analytics and cost tracking

### Roadmap
- **v2.1**: Gemini and Cohere adapters
- **v2.2**: Local model support
- **v2.3**: Advanced caching and analytics
- **v3.0**: Plugin system for custom adapters

## 📚 API Reference

### AIService Class

```typescript
class AIService {
  // Initialize with configuration
  async initialize(config?: AIServiceConfig): Promise<void>
  
  // Generate recommendations
  async generateRecommendations(product: Product): Promise<RecommendationResponse | APIError>
  
  // Provider management
  getActiveProvider(): AIProvider | null
  getAvailableProviders(): AIProvider[]
  async switchProvider(provider: AIProvider): Promise<boolean>
  
  // Health monitoring
  async getHealthStatus(): Promise<Record<AIProvider, boolean>>
  getAdapterInfo(): Record<AIProvider, any>
}
```

### Configuration Types

```typescript
interface AIServiceConfig {
  primaryProvider?: AIProvider;
  fallbackProviders?: AIProvider[];
  enableFallback?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  providers?: {
    openai?: { apiKey?: string; model?: string; };
    grok?: { apiKey?: string; model?: string; };
    claude?: { apiKey?: string; model?: string; };
  };
}
```

## 🤝 Contributing

To add a new AI provider:

1. **Create Adapter**: Extend `BaseAIAdapter`
2. **Add Configuration**: Update types and default configs
3. **Register Provider**: Add to adapter manager
4. **Add Tests**: Create provider-specific tests
5. **Update Documentation**: Document the new provider

See [Contributing Guide](../CONTRIBUTING.md) for detailed instructions.

---

**The AI Adapters System makes your e-commerce platform future-proof by supporting multiple AI providers with automatic fallback, ensuring your customers always get great product recommendations! 🚀**
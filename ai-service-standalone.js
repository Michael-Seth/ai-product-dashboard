/**
 * Standalone AI Service for Development Server
 * 
 * This is a simplified version of the AI service that can be used
 * directly by the development server without complex build processes.
 */

require('dotenv').config();

class StandaloneAIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.grokApiKey = process.env.GROK_API_KEY;
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    
    console.log('🤖 AI Service initialized with providers:');
    console.log(`   OpenAI: ${this.openaiApiKey ? '✅' : '❌'}`);
    console.log(`   Grok: ${this.grokApiKey ? '✅' : '❌'}`);
    console.log(`   Claude: ${this.claudeApiKey ? '✅' : '❌'}`);
  }

  async generateRecommendations(product) {
    console.log(`🔍 Generating recommendations for: ${product.name}`);
    
    // Try OpenAI first
    if (this.openaiApiKey) {
      try {
        return await this.generateWithOpenAI(product);
      } catch (error) {
        console.warn('⚠️ OpenAI failed:', error.message);
        console.log('🔄 Trying Grok as fallback...');
      }
    }
    
    // Try Grok if OpenAI failed or is not available
    if (this.grokApiKey) {
      try {
        return await this.generateWithGrok(product);
      } catch (error) {
        console.warn('⚠️ Grok failed:', error.message);
        console.log('🔄 Trying Claude as fallback...');
      }
    }
    
    // Try Claude if others failed or are not available
    if (this.claudeApiKey) {
      try {
        return await this.generateWithClaude(product);
      } catch (error) {
        console.warn('⚠️ Claude failed:', error.message);
        console.log('🔄 Using fallback recommendations...');
      }
    }
    
    // If all AI providers fail, use fallback
    console.log('🔄 All AI providers failed, using fallback recommendations');
    return this.generateFallbackRecommendations(product);
  }

  async generateWithOpenAI(product) {
    console.log('🤖 Using OpenAI for recommendations...');
    
    const prompt = `Based on this product: ${product.name} - ${product.description} (Price: $${product.price}), recommend 3 similar or complementary products. Return a JSON array with objects containing: id, name, description, price, confidence (0-1). Make the recommendations realistic and relevant.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const recommendations = JSON.parse(content);
      return this.formatRecommendations(recommendations);
    } catch (parseError) {
      console.warn('⚠️ Could not parse OpenAI response as JSON, using fallback');
      return this.generateFallbackRecommendations(product);
    }
  }

  async generateWithGrok(product) {
    console.log('🤖 Using Grok for recommendations...');
    
    const prompt = `Based on this product: ${product.name} - ${product.description} (Price: $${product.price}), recommend 3 similar or complementary products. Return a JSON array with objects containing: id, name, description, price, confidence (0-1).`;
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.grokApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const recommendations = JSON.parse(content);
      return this.formatRecommendations(recommendations);
    } catch (parseError) {
      console.warn('⚠️ Could not parse Grok response as JSON, using fallback');
      return this.generateFallbackRecommendations(product);
    }
  }

  async generateWithClaude(product) {
    console.log('🤖 Using Claude for recommendations...');
    
    const prompt = `Based on this product: ${product.name} - ${product.description} (Price: $${product.price}), recommend 3 similar or complementary products. Return a JSON array with objects containing: id, name, description, price, confidence (0-1).`;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.claudeApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    try {
      const recommendations = JSON.parse(content);
      return this.formatRecommendations(recommendations);
    } catch (parseError) {
      console.warn('⚠️ Could not parse Claude response as JSON, using fallback');
      return this.generateFallbackRecommendations(product);
    }
  }

  formatRecommendations(recommendations) {
    return recommendations.map((rec, index) => ({
      id: rec.id || `ai-rec-${index + 1}`,
      name: rec.name || 'AI Recommended Product',
      description: rec.description || 'AI generated recommendation',
      price: rec.price || 99,
      imageUrl: rec.imageUrl || 'https://via.placeholder.com/300x200',
      confidence: rec.confidence || 0.8
    }));
  }

  generateFallbackRecommendations(product) {
    console.log('🔄 Using fallback recommendations');
    
    const basePrice = product.price || 100;
    
    return [
      {
        id: 'fallback-1',
        name: `Premium ${product.name} Case`,
        description: `Protective case designed for ${product.name}`,
        price: Math.round(basePrice * 0.1),
        imageUrl: 'https://via.placeholder.com/300x200',
        confidence: 0.85
      },
      {
        id: 'fallback-2', 
        name: `${product.name} Accessories Kit`,
        description: `Essential accessories for your ${product.name}`,
        price: Math.round(basePrice * 0.2),
        imageUrl: 'https://via.placeholder.com/300x200',
        confidence: 0.78
      },
      {
        id: 'fallback-3',
        name: `Extended Warranty for ${product.name}`,
        description: `2-year extended warranty coverage`,
        price: Math.round(basePrice * 0.15),
        imageUrl: 'https://via.placeholder.com/300x200',
        confidence: 0.72
      }
    ];
  }
}

module.exports = { StandaloneAIService };
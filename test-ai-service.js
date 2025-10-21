#!/usr/bin/env node

/**
 * Test AI Service Directly
 */

const { StandaloneAIService } = require('./ai-service-standalone');

const testProduct = {
  id: '1',
  name: 'MacBook Air M2',
  description: 'Lightweight laptop with M2 chip',
  price: 1199
};

async function testAIService() {
  console.log('🧪 Testing AI Service directly...');
  console.log('📦 Test product:', testProduct.name);
  
  try {
    const aiService = new StandaloneAIService();
    const recommendations = await aiService.generateRecommendations(testProduct);
    
    console.log('✅ AI Service working!');
    console.log('📊 Recommendations:', recommendations.length);
    
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.name}`);
      console.log(`   Price: $${rec.price}`);
      console.log(`   Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
      console.log(`   Description: ${rec.description}`);
    });
    
  } catch (error) {
    console.error('❌ AI Service failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAIService();
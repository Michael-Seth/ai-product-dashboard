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
  try {
    const aiService = new StandaloneAIService();
    const recommendations = await aiService.generateRecommendations(testProduct);
    recommendations.forEach((rec, index) => {
    });
    
  } catch (error) {
    console.error(' AI Service failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAIService();
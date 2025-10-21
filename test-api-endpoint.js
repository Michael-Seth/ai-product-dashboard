#!/usr/bin/env node

/**
 * Test API Endpoint
 */

async function testAPI() {
  console.log('🧪 Testing /api/recommendations endpoint...');
  
  const testProduct = {
    id: '1',
    name: 'MacBook Air M2',
    description: 'Lightweight laptop with M2 chip',
    price: 1199
  };

  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:3002/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product: testProduct })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ API Response received!');
    console.log('📊 Recommendations:', data.recommendations.length);
    
    data.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.name}`);
      console.log(`   ID: ${rec.id}`);
      console.log(`   Price: $${rec.price}`);
      console.log(`   Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
      console.log(`   Description: ${rec.description}`);
    });
    
    console.log('\n🎉 API endpoint is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
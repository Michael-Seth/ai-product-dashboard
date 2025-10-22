#!/usr/bin/env node

/**
 * Test API Endpoint
 */

async function testAPI() {
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
    data.recommendations.forEach((rec, index) => {
    });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
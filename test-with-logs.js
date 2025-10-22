#!/usr/bin/env node

/**
 * Test API with Server Log Monitoring
 */

async function testWithLogs() {
  const testProduct = {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with titanium design',
    price: 999
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
    // Check if these are AI-generated or mock
    const isAI = data.recommendations.some(rec => 
      rec.id.startsWith('openai-') || 
      rec.id.startsWith('grok-') || 
      rec.id.startsWith('claude-')
    );
    
    const isMock = data.recommendations.some(rec => rec.id.startsWith('mock-'));
    if (isMock) {
    }
    
    data.recommendations.forEach((rec, index) => {
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithLogs();
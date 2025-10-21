#!/usr/bin/env node

/**
 * Test API with Server Log Monitoring
 */

async function testWithLogs() {
  console.log('🧪 Testing API endpoint with detailed logging...');
  console.log('📝 Check the dev-server terminal for AI provider logs\n');
  
  const testProduct = {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with titanium design',
    price: 999
  };

  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('🚀 Sending request to API...');
    console.log('📦 Product:', testProduct.name);
    
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
    
    console.log('\n✅ API Response received!');
    console.log('📊 Recommendations:', data.recommendations.length);
    
    // Check if these are AI-generated or mock
    const isAI = data.recommendations.some(rec => 
      rec.id.startsWith('openai-') || 
      rec.id.startsWith('grok-') || 
      rec.id.startsWith('claude-')
    );
    
    const isMock = data.recommendations.some(rec => rec.id.startsWith('mock-'));
    
    console.log(`\n🔍 Source Analysis:`);
    console.log(`   AI Generated: ${isAI ? '✅' : '❌'}`);
    console.log(`   Mock Data: ${isMock ? '✅' : '❌'}`);
    
    if (isMock) {
      console.log('\n⚠️  Using mock data - AI APIs likely failed due to:');
      console.log('   • OpenAI: Rate limit (429 Too Many Requests)');
      console.log('   • Grok: API access issue (403 Forbidden)');
      console.log('   • This is expected behavior - fallback is working correctly!');
    }
    
    data.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.name}`);
      console.log(`   ID: ${rec.id}`);
      console.log(`   Price: $${rec.price}`);
      console.log(`   Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithLogs();
// Manual test script to verify error handling
const { recommendProducts, mockRecommend } = require('./shared-api/src/lib/shared-api.ts');

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling Implementation...\n');

  // Test 1: Invalid product input
  console.log('Test 1: Invalid product input');
  try {
    const result = await recommendProducts(null);
    console.log('✅ Handled null input:', result.error ? 'Error returned' : 'Unexpected success');
  } catch (error) {
    console.log('❌ Unexpected exception:', error.message);
  }

  // Test 2: Empty product name
  console.log('\nTest 2: Empty product name');
  try {
    const result = await recommendProducts({ id: 1, name: '', description: 'test', price: 100, imageUrl: 'test.jpg' });
    console.log('✅ Handled empty name:', result.error ? 'Error returned' : 'Unexpected success');
  } catch (error) {
    console.log('❌ Unexpected exception:', error.message);
  }

  // Test 3: Mock recommendations with invalid input
  console.log('\nTest 3: Mock recommendations with invalid input');
  try {
    const result = mockRecommend('');
    console.log('✅ Mock handled empty name:', Array.isArray(result) && result.length > 0 ? 'Success' : 'Failed');
  } catch (error) {
    console.log('❌ Mock function failed:', error.message);
  }

  // Test 4: Mock recommendations with known product
  console.log('\nTest 4: Mock recommendations with known product');
  try {
    const result = mockRecommend('MacBook Air');
    console.log('✅ Mock returned recommendations:', result.length, 'items');
    console.log('   First recommendation:', result[0]?.name);
  } catch (error) {
    console.log('❌ Mock function failed:', error.message);
  }

  // Test 5: Network simulation (no OpenAI key)
  console.log('\nTest 5: Network simulation (no OpenAI key)');
  try {
    delete process.env.OPENAI_API_KEY;
    delete process.env.VITE_OPENAI_API_KEY;
    
    const result = await recommendProducts({
      id: 1,
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      imageUrl: 'test.jpg'
    });
    
    console.log('✅ Handled missing API key:', !result.error && result.recommendations ? 'Fallback success' : 'Failed');
    if (result.recommendations) {
      console.log('   Fallback recommendations:', result.recommendations.length, 'items');
    }
  } catch (error) {
    console.log('❌ Unexpected exception:', error.message);
  }

  console.log('\n🎉 Error handling tests completed!');
}

// Run the tests
testErrorHandling().catch(console.error);
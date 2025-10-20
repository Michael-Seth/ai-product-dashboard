
const { recommendProducts, mockRecommend } = require('./shared-api/src/lib/shared-api.ts');

async function testErrorHandling() {
  try {
    const result = await recommendProducts(null);
  } catch (error) {
  }
  try {
    const result = await recommendProducts({ id: 1, name: '', description: 'test', price: 100, imageUrl: 'test.jpg' });
  } catch (error) {
  }
  try {
    const result = mockRecommend('');
  } catch (error) {
  }
  try {
    const result = mockRecommend('MacBook Air');
  } catch (error) {
  }
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
    if (result.recommendations) {
    }
  } catch (error) {
  }
}
testErrorHandling().catch(console.error);
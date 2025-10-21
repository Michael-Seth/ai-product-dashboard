const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// AI Service Integration
async function getAIRecommendations(productName) {
  try {
    // Try OpenAI first
    if (process.env.OPENAI_API_KEY) {
      console.log(`🤖 Using OpenAI to generate recommendations for: ${productName}`);
      return await getOpenAIRecommendations(productName);
    }
    
    // Fallback to Grok
    if (process.env.GROK_API_KEY) {
      console.log(`🤖 Using Grok to generate recommendations for: ${productName}`);
      return await getGrokRecommendations(productName);
    }
    
    // Fallback to mock if no API keys
    console.log(`⚠️ No AI API keys found, using mock recommendations for: ${productName}`);
    return getMockRecommendations(productName);
    
  } catch (error) {
    console.error('❌ AI API Error:', error.message);
    console.log(`🔄 Falling back to mock recommendations for: ${productName}`);
    return getMockRecommendations(productName);
  }
}

async function getOpenAIRecommendations(productName) {
  const { OpenAI } = require('openai');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Generate 3 product recommendations for someone who is interested in "${productName}". 
  
  Return a JSON array with objects containing:
  - id: unique identifier (string)
  - name: product name (string)
  - description: brief description (string)
  - price: estimated price in USD (number)
  - confidence: confidence score 0-1 (number)
  
  Focus on accessories, complementary products, or upgrades that would genuinely interest someone buying "${productName}".
  Make the recommendations realistic and relevant.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  
  try {
    const recommendations = JSON.parse(content);
    const formattedRecs = (Array.isArray(recommendations) ? recommendations : recommendations.recommendations || [])
      .map((rec, index) => ({
        id: rec.id || `openai-${index + 1}`,
        name: rec.name || 'AI Recommended Product',
        description: rec.description || rec.reason || 'AI generated recommendation',
        price: rec.price || 99,
        imageUrl: rec.imageUrl || 'https://via.placeholder.com/300x200',
        confidence: rec.confidence || 0.8
      }));
    
    return formattedRecs;
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError);
    return getMockRecommendations(productName);
  }
}

async function getGrokRecommendations(productName) {
  const fetch = require('node-fetch');
  
  const prompt = `Generate 3 product recommendations for someone interested in "${productName}". 
  
  Return a JSON array with objects containing:
  - id: unique identifier (string)
  - name: product name (string)  
  - description: brief description (string)
  - price: estimated price in USD (number)
  - confidence: confidence score 0-1 (number)
  
  Make the recommendations realistic and relevant.`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'grok-beta',
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const recommendations = JSON.parse(content);
    const formattedRecs = (Array.isArray(recommendations) ? recommendations : recommendations.recommendations || [])
      .map((rec, index) => ({
        id: rec.id || `grok-${index + 1}`,
        name: rec.name || 'AI Recommended Product',
        description: rec.description || rec.reason || 'AI generated recommendation',
        price: rec.price || 99,
        imageUrl: rec.imageUrl || 'https://via.placeholder.com/300x200',
        confidence: rec.confidence || 0.8
      }));
    
    return formattedRecs;
  } catch (parseError) {
    console.error('Failed to parse Grok response:', parseError);
    return getMockRecommendations(productName);
  }
}

function getMockRecommendations(productName) {
  return [
    {
      id: 'mock-1',
      name: `${productName} Pro Case`,
      description: `Perfect protection for your ${productName} with premium materials`,
      price: 49,
      imageUrl: 'https://via.placeholder.com/300x200',
      confidence: 0.85
    },
    {
      id: 'mock-2',
      name: `${productName} Wireless Mouse`,
      description: `Ergonomic wireless mouse designed to complement your ${productName}`,
      price: 79,
      imageUrl: 'https://via.placeholder.com/300x200',
      confidence: 0.78
    },
    {
      id: 'mock-3',
      name: `${productName} External Monitor`,
      description: `Expand your workspace with a high-resolution display for ${productName}`,
      price: 299,
      imageUrl: 'https://via.placeholder.com/300x200',
      confidence: 0.72
    },
    {
      id: 'mock-4',
      name: `${productName} Charging Dock`,
      description: `Keep your ${productName} charged and organized with this sleek dock`,
      price: 89,
      imageUrl: 'https://via.placeholder.com/300x200',
      confidence: 0.68
    }
  ];
}

app.post('/api/recommendations', async (req, res) => {
  const { product, productName } = req.body;
  
  // Support both product object and productName string for flexibility
  const name = product?.name || productName;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Product name is required and must be a non-empty string'
    });
  }

  try {
    console.log(`📝 Generating recommendations for: ${name}`);
    const recommendations = await getAIRecommendations(name.trim());
    
    console.log(`✅ Generated ${recommendations.length} recommendations`);
    res.json({ recommendations });
    
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate recommendations. Please try again.'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development API server is running' });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    message: `The endpoint ${req.path} is not available on this development server`
  });
});

app.listen(PORT, () => {
  console.log(` Development API server running on http://localhost:${PORT}`);
});
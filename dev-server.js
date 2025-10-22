const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
async function getAIRecommendations(productName) {
  try {
    if (process.env.OPENAI_API_KEY) {
      return await getOpenAIRecommendations(productName);
    }
    if (process.env.GROK_API_KEY) {
      return await getGrokRecommendations(productName);
    }
    return getMockRecommendations(productName);
    
  } catch (error) {
    console.error('❌ AI API Error:', error.message);
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
  - name: product name (string)
  - reason: brief explanation why this is recommended (string)
  - price: estimated price in USD (number)
  
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
      .map((rec) => ({
        name: rec.name || 'AI Recommended Product',
        reason: rec.reason || rec.description || 'AI generated recommendation',
        price: rec.price || 99.99,
        image: 'https://via.placeholder.com/300x200/6366F1/FFFFFF?text=AI+Recommendation'
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
  - name: product name (string)
  - reason: brief explanation why this is recommended (string)
  - price: estimated price in USD (number)
  
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
      .map((rec) => ({
        name: rec.name || 'AI Recommended Product',
        reason: rec.reason || rec.description || 'AI generated recommendation',
        price: rec.price || 99.99,
        image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=AI+Recommendation'
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
      name: `${productName} Pro Case`,
      reason: `Perfect protection for your ${productName} with premium materials`,
      price: 49.99,
      image: 'https://imosiso.com/cdn/shop/files/28black1@2x.jpg?v=1740801503'
    },
    {
      name: `${productName} Wireless Mouse`,
      reason: `Ergonomic wireless mouse designed to complement your ${productName}`,
      price: 79.99,
      image: 'https://m.media-amazon.com/images/I/51KmxQjXBlL.jpg'
    },
    {
      name: `${productName} External Monitor`,
      reason: `Expand your workspace with a high-resolution display for ${productName}`,
      price: 299.99,
      image: 'https://www-konga-com-res.cloudinary.com/f_auto,fl_lossy,dpr_auto,q_auto/media/catalog/product/W/F/69398_1714747540.jpg'
    },
    {
      name: `${productName} Charging Dock`,
      reason: `Keep your ${productName} charged and organized with this sleek dock`,
      price: 89.99,
      image: 'https://www.betterlivingthroughdesign.com/images/Alldock-2.jpg'
    }
  ];
}

app.post('/api/recommendations', async (req, res) => {
  const { product, productName } = req.body;
  const name = product?.name || productName;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Product name is required and must be a non-empty string'
    });
  }

  try {
    const recommendations = await getAIRecommendations(name.trim());
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
// Import OpenAI directly since we can't easily use the TypeScript shared library in Vercel functions
const OpenAI = require('openai');

/**
 * Mock recommendation function that provides fallback data
 */
function mockRecommend(productName) {
  const mockRecommendations = {
    'MacBook Air': [
      { name: 'MacBook Pro', reason: 'More powerful processor and better graphics for demanding tasks' },
      { name: 'iPad Pro', reason: 'Portable alternative with touch interface and Apple Pencil support' },
      { name: 'Magic Mouse', reason: 'Perfect wireless mouse companion for your MacBook setup' },
      { name: 'USB-C Hub', reason: 'Expand connectivity with multiple ports for peripherals' }
    ],
    'Dell XPS 13': [
      { name: 'Dell XPS 15', reason: 'Larger screen and more powerful specs for enhanced productivity' },
      { name: 'Dell Wireless Mouse', reason: 'Ergonomic wireless mouse designed for Dell laptops' },
      { name: 'Dell Monitor', reason: 'External monitor to create a dual-screen workspace' },
      { name: 'Laptop Stand', reason: 'Improve ergonomics and cooling with an adjustable stand' }
    ],
    'ThinkPad X1 Carbon': [
      { name: 'ThinkPad Docking Station', reason: 'One-cable solution for connecting multiple peripherals' },
      { name: 'Lenovo Wireless Keyboard', reason: 'Full-size keyboard for comfortable extended typing' },
      { name: 'ThinkPad Travel Mouse', reason: 'Compact mouse designed for business professionals' },
      { name: 'Laptop Bag', reason: 'Professional carrying case designed for ThinkPad laptops' }
    ]
  };

  // Return specific recommendations if available, otherwise generic ones
  return mockRecommendations[productName] || [
    { name: 'Laptop Stand', reason: 'Improve ergonomics and airflow for any laptop' },
    { name: 'Wireless Mouse', reason: 'Enhanced productivity with precise cursor control' },
    { name: 'External Monitor', reason: 'Expand your workspace with a larger display' },
    { name: 'USB-C Charger', reason: 'Backup power solution for mobile productivity' }
  ];
}

/**
 * Generate AI-powered product recommendations using OpenAI GPT-4o-mini
 */
async function recommendProducts(product) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Fall back to mock if OpenAI is not available
    if (!apiKey) {
      console.warn('OpenAI API key not found. Falling back to mock recommendations.');
      return {
        recommendations: mockRecommend(product.name)
      };
    }

    const client = new OpenAI({
      apiKey: apiKey,
    });

    const prompt = `You are a product recommendation expert. Given the following product, suggest 3-4 related or complementary products that a customer might be interested in.

Product: ${product.name}
Description: ${product.description}
Price: ${product.price}

Please respond with a JSON object containing an array of recommendations. Each recommendation should have:
- name: The product name
- reason: A brief explanation (1-2 sentences) of why this product complements or relates to the original

Format your response as valid JSON:
{
  "recommendations": [
    {"name": "Product Name", "reason": "Brief explanation"},
    ...
  ]
}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful product recommendation assistant. Always respond with valid JSON in the exact format requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response content from OpenAI');
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(responseContent);
    
    // Validate the response structure
    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate each recommendation has required fields
    for (const rec of parsedResponse.recommendations) {
      if (!rec.name || !rec.reason || typeof rec.name !== 'string' || typeof rec.reason !== 'string') {
        throw new Error('Invalid recommendation format');
      }
    }

    return parsedResponse;

  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // If OpenAI fails, fall back to mock recommendations
    if (error.message.includes('API key') || 
        error.message.includes('network') ||
        error.message.includes('timeout')) {
      console.log('Falling back to mock recommendations due to API error');
      return {
        recommendations: mockRecommend(product.name)
      };
    }

    // For other errors, return an error response
    return {
      error: 'Failed to generate recommendations',
      message: error.message || 'Unknown error occurred'
    };
  }
}

module.exports = async (req, res) => {
  // Enable CORS with error handling
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  } catch (headerError) {
    console.error('Error setting CORS headers:', headerError);
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported for this endpoint'
    });
    return;
  }

  let productName;
  
  try {
    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({
        error: 'Bad request',
        message: 'Request body is required and must be valid JSON'
      });
      return;
    }

    productName = req.body.productName;

    // Validate productName
    if (!productName) {
      res.status(400).json({
        error: 'Bad request',
        message: 'productName is required in request body'
      });
      return;
    }

    if (typeof productName !== 'string') {
      res.status(400).json({
        error: 'Bad request',
        message: 'productName must be a string'
      });
      return;
    }

    if (productName.trim().length === 0) {
      res.status(400).json({
        error: 'Bad request',
        message: 'productName cannot be empty'
      });
      return;
    }

    // Sanitize productName
    productName = productName.trim();
    
    // Limit productName length to prevent abuse
    if (productName.length > 200) {
      res.status(400).json({
        error: 'Bad request',
        message: 'productName is too long (maximum 200 characters)'
      });
      return;
    }

    console.log(`Received recommendation request for: ${productName}`);

    // Create a mock product object for the API function
    const mockProduct = {
      id: 1,
      name: productName,
      description: `${productName} - Premium laptop computer`,
      price: 999,
      imageUrl: 'https://via.placeholder.com/300x200'
    };

    // Use the recommendation function with timeout
    const result = await Promise.race([
      recommendProducts(mockProduct),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout after 30 seconds')), 30000)
      )
    ]);

    // Handle both success and error responses
    if ('error' in result) {
      // Log error but still try to provide fallback
      console.error('Recommendation function returned error:', result);
      
      // If it's a service error, try fallback
      if (result.error === 'Service temporarily unavailable') {
        const fallbackRecommendations = mockRecommend(productName);
        res.status(200).json({
          recommendations: fallbackRecommendations
        });
      } else {
        res.status(500).json(result);
      }
    } else {
      // Validate successful response
      if (!result.recommendations || !Array.isArray(result.recommendations)) {
        console.error('Invalid response format:', result);
        const fallbackRecommendations = mockRecommend(productName);
        res.status(200).json({
          recommendations: fallbackRecommendations
        });
      } else {
        res.status(200).json(result);
      }
    }

  } catch (error) {
    console.error('Error in recommendations API:', error);
    
    // Categorize errors for better handling
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let userMessage = 'Failed to generate recommendations';

    if (error.message.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Gateway timeout';
      userMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      statusCode = 503;
      errorMessage = 'Service unavailable';
      userMessage = 'External service is temporarily unavailable.';
    } else if (error.message.includes('JSON')) {
      statusCode = 400;
      errorMessage = 'Bad request';
      userMessage = 'Invalid request format.';
    }

    // Always try to provide fallback recommendations
    try {
      if (productName && typeof productName === 'string') {
        const fallbackRecommendations = mockRecommend(productName);
        console.log('Providing fallback recommendations due to error');
        res.status(200).json({
          recommendations: fallbackRecommendations
        });
        return;
      }
    } catch (fallbackError) {
      console.error('Fallback recommendations also failed:', fallbackError);
    }

    // If even fallback fails, return error
    res.status(statusCode).json({
      error: errorMessage,
      message: userMessage
    });
  }
};
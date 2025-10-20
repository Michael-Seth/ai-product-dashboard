import OpenAI from 'openai';
import {
  Product,
  Recommendation,
  RecommendationResponse,
  APIError,
} from '@ai-product-dashboard/shared-types';

/**
 * OpenAI client instance - initialized lazily when needed
 */
let openaiClient: OpenAI | null = null;

/**
 * Reset the OpenAI client (for testing purposes)
 */
export function resetOpenAIClient(): void {
  openaiClient = null;
}

/**
 * Initialize OpenAI client with API key validation
 */
function getOpenAIClient(): OpenAI | null {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey =
    process.env['OPENAI_API_KEY'] || process.env['VITE_OPENAI_API_KEY'];

  if (!apiKey) {
    console.warn(
      'OpenAI API key not found. Falling back to mock recommendations.'
    );
    return null;
  }

  try {
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
    return openaiClient;
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
}

/**
 * Mock recommendation function that provides fallback data
 */
export function mockRecommend(productName: string): Recommendation[] {
  // Input validation for mock function
  if (!productName || typeof productName !== 'string') {
    console.warn(
      'Invalid product name for mock recommendations, using default'
    );
    productName = 'Generic Product';
  }

  const mockRecommendations: Record<string, Recommendation[]> = {
    'MacBook Air': [
      {
        name: 'MacBook Pro',
        reason:
          'More powerful processor and better graphics for demanding tasks',
      },
      {
        name: 'iPad Pro',
        reason:
          'Portable alternative with touch interface and Apple Pencil support',
      },
      {
        name: 'Magic Mouse',
        reason: 'Perfect wireless mouse companion for your MacBook setup',
      },
      {
        name: 'USB-C Hub',
        reason: 'Expand connectivity with multiple ports for peripherals',
      },
    ],
    'Dell XPS 13': [
      {
        name: 'Dell XPS 15',
        reason:
          'Larger screen and more powerful specs for enhanced productivity',
      },
      {
        name: 'Dell Wireless Mouse',
        reason: 'Ergonomic wireless mouse designed for Dell laptops',
      },
      {
        name: 'Dell Monitor',
        reason: 'External monitor to create a dual-screen workspace',
      },
      {
        name: 'Laptop Stand',
        reason: 'Improve ergonomics and cooling with an adjustable stand',
      },
    ],
    'ThinkPad X1 Carbon': [
      {
        name: 'ThinkPad Docking Station',
        reason: 'One-cable solution for connecting multiple peripherals',
      },
      {
        name: 'Lenovo Wireless Keyboard',
        reason: 'Full-size keyboard for comfortable extended typing',
      },
      {
        name: 'ThinkPad Travel Mouse',
        reason: 'Compact mouse designed for business professionals',
      },
      {
        name: 'Laptop Bag',
        reason: 'Professional carrying case designed for ThinkPad laptops',
      },
    ],
  };

  // Return specific recommendations if available, otherwise generic ones
  return (
    mockRecommendations[productName] || [
      {
        name: 'Laptop Stand',
        reason: 'Improve ergonomics and airflow for any laptop',
      },
      {
        name: 'Wireless Mouse',
        reason: 'Enhanced productivity with precise cursor control',
      },
      {
        name: 'External Monitor',
        reason: 'Expand your workspace with a larger display',
      },
      {
        name: 'USB-C Charger',
        reason: 'Backup power solution for mobile productivity',
      },
    ]
  );
}

/**
 * Generate AI-powered product recommendations using OpenAI GPT-4o-mini
 */
export async function recommendProducts(
  product: Product
): Promise<RecommendationResponse | APIError> {
  // Input validation
  if (!product || typeof product !== 'object') {
    console.error('Invalid product input:', product);
    return {
      error: 'Invalid product data',
      message: 'Product information is required to generate recommendations',
    };
  }

  if (
    !product.name ||
    typeof product.name !== 'string' ||
    product.name.trim().length === 0
  ) {
    console.error('Invalid product name:', product.name);
    return {
      error: 'Invalid product name',
      message: 'Product name is required and must be a non-empty string',
    };
  }

  try {
    const client = getOpenAIClient();

    // Fall back to mock if OpenAI is not available
    if (!client) {
      console.log('OpenAI client not available, using mock recommendations');
      return {
        recommendations: mockRecommend(product.name),
      };
    }

    const prompt = `You are a product recommendation expert. Given the following product, suggest 3-4 related or complementary products that a customer might be interested in.

Product: ${product.name}
Description: ${product.description || 'No description available'}
Price: ${product.price || 'Price not specified'}

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

    let completion: unknown;
    try {
      completion = await Promise.race([
        client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful product recommendation assistant. Always respond with valid JSON in the exact format requested.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
        // Add timeout to prevent hanging requests
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout after 10 seconds')),
            10000
          )
        ),
      ]);
    } catch (timeoutError) {
      console.warn(
        'OpenAI request timed out, falling back to mock recommendations'
      );
      return {
        recommendations: mockRecommend(product.name),
      };
    }

    const responseContent = (completion as any).choices[0]?.message?.content;

    if (!responseContent) {
      console.warn('No response content from OpenAI, falling back to mock');
      return {
        recommendations: mockRecommend(product.name),
      };
    }

    let parsedResponse: RecommendationResponse;
    try {
      parsedResponse = JSON.parse(responseContent) as RecommendationResponse;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.log('Raw response:', responseContent);
      return {
        recommendations: mockRecommend(product.name),
      };
    }

    // Validate the response structure
    if (
      !parsedResponse.recommendations ||
      !Array.isArray(parsedResponse.recommendations)
    ) {
      console.error('Invalid response format from OpenAI:', parsedResponse);
      return {
        recommendations: mockRecommend(product.name),
      };
    }

    // Validate and sanitize each recommendation
    const validRecommendations: Recommendation[] = [];
    for (const rec of parsedResponse.recommendations) {
      if (
        rec &&
        typeof rec === 'object' &&
        rec.name &&
        rec.reason &&
        typeof rec.name === 'string' &&
        typeof rec.reason === 'string' &&
        rec.name.trim().length > 0 &&
        rec.reason.trim().length > 0
      ) {
        validRecommendations.push({
          name: rec.name.trim(),
          reason: rec.reason.trim(),
        });
      } else {
        console.warn('Skipping invalid recommendation:', rec);
      }
    }

    // If no valid recommendations, fall back to mock
    if (validRecommendations.length === 0) {
      console.warn(
        'No valid recommendations from OpenAI, falling back to mock'
      );
      return {
        recommendations: mockRecommend(product.name),
      };
    }

    return {
      recommendations: validRecommendations,
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);

    // Categorize errors and provide appropriate fallbacks
    if (error instanceof Error) {
      // Network-related errors - fall back to mock
      if (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('timeout')
      ) {
        console.log(
          'Network error detected, falling back to mock recommendations'
        );
        return {
          recommendations: mockRecommend(product.name),
        };
      }

      // API key or authentication errors - fall back to mock
      if (
        error.message.includes('API key') ||
        error.message.includes('authentication') ||
        error.message.includes('unauthorized') ||
        error.message.includes('401')
      ) {
        console.log(
          'Authentication error detected, falling back to mock recommendations'
        );
        return {
          recommendations: mockRecommend(product.name),
        };
      }

      // Rate limiting errors - fall back to mock
      if (
        error.message.includes('rate limit') ||
        error.message.includes('429') ||
        error.message.includes('quota')
      ) {
        console.log(
          'Rate limit error detected, falling back to mock recommendations'
        );
        return {
          recommendations: mockRecommend(product.name),
        };
      }

      // Server errors - fall back to mock
      if (
        error.message.includes('500') ||
        error.message.includes('502') ||
        error.message.includes('503') ||
        error.message.includes('504')
      ) {
        console.log(
          'Server error detected, falling back to mock recommendations'
        );
        return {
          recommendations: mockRecommend(product.name),
        };
      }
    }

    // For any other errors, still try to provide mock recommendations
    console.log(
      'Unknown error occurred, attempting to provide mock recommendations'
    );
    try {
      return {
        recommendations: mockRecommend(product.name),
      };
    } catch (mockError) {
      console.error('Even mock recommendations failed:', mockError);
      return {
        error: 'Service temporarily unavailable',
        message:
          'Unable to generate recommendations at this time. Please try again later.',
      };
    }
  }
}

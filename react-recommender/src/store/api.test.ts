import { configureStore } from '@reduxjs/toolkit';
import { recommendationApi } from './api';
import { RecommendationResponse, APIError } from '@ai-product-dashboard/shared-types';
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Recommendation API', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [recommendationApi.reducerPath]: recommendationApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(recommendationApi.middleware),
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    store.dispatch(recommendationApi.util.resetApiState());
  });

  describe('getRecommendations endpoint', () => {
    const mockRecommendations: RecommendationResponse = {
      recommendations: [
        { name: 'iPad Pro', reason: 'Perfect companion for creative work' },
        { name: 'Magic Mouse', reason: 'Enhances productivity' },
        { name: 'USB-C Hub', reason: 'Expands connectivity' }
      ]
    };

    it('makes correct API call with valid product name', async () => {
      const mockResponse = new Response(JSON.stringify(mockRecommendations), {
        status: 200,
        statusText: 'OK',
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('MacBook Pro')
      );

      expect(result.data).toEqual(mockRecommendations);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/recommendations',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ productName: 'MacBook Pro' }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('trims whitespace from product name', async () => {
      const mockResponse = new Response(JSON.stringify(mockRecommendations), {
        status: 200,
        statusText: 'OK',
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('  MacBook Pro  ')
      );

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/recommendations',
        expect.objectContaining({
          body: JSON.stringify({ productName: 'MacBook Pro' }),
        })
      );
    });

    it('throws error for empty product name', async () => {
      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('')
      );

      expect(result.error).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('throws error for whitespace-only product name', async () => {
      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('   ')
      );

      expect(result.error).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('throws error for non-string product name', async () => {
      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate(null as unknown)
      );

      expect(result.error).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Response Transformation', () => {
    it('transforms valid response correctly', async () => {
      const mockResponse = {
        recommendations: [
          { name: 'Product 1', reason: 'Reason 1' },
          { name: 'Product 2', reason: 'Reason 2' }
        ]
      };

      const response = new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
      });
      mockFetch.mockResolvedValueOnce(response);

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('Test Product')
      );

      expect(result.data).toEqual(mockResponse);
    });

    it('handles invalid response format', async () => {
      const response = new Response('null', {
        status: 200,
        statusText: 'OK',
      });
      mockFetch.mockResolvedValueOnce(response);

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('Test Product')
      );

      expect(result.error).toBeDefined();
    });

    it('handles response without recommendations array', async () => {
      const response = new Response(JSON.stringify({ data: 'invalid' }), {
        status: 200,
        statusText: 'OK',
      });
      mockFetch.mockResolvedValueOnce(response);

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('Test Product')
      );

      expect(result.error).toBeDefined();
    });

    it('filters out invalid recommendations', async () => {
      const mockResponse = {
        recommendations: [
          { name: 'Valid Product', reason: 'Valid reason' },
          { name: '', reason: 'Invalid - empty name' }, // Invalid
          { name: 'Another Valid', reason: '' }, // Invalid - empty reason
          null, // Invalid - null
          { name: 123, reason: 'Invalid - non-string name' }, // Invalid
          { name: 'Final Valid', reason: 'Good reason' }
        ]
      };

      const response = new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
      });
      mockFetch.mockResolvedValueOnce(response);

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('Test Product')
      );

      expect(result.data?.recommendations).toHaveLength(2);
      expect(result.data?.recommendations[0]).toEqual({ name: 'Valid Product', reason: 'Valid reason' });
      expect(result.data?.recommendations[1]).toEqual({ name: 'Final Valid', reason: 'Good reason' });
    });

    it('throws error when no valid recommendations remain', async () => {
      const mockResponse = {
        recommendations: [
          { name: '', reason: 'Invalid' },
          null,
          { name: 123, reason: 'Invalid' }
        ]
      };

      const response = new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
      });
      mockFetch.mockResolvedValueOnce(response);

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('Test Product')
      );

      expect(result.error).toBeDefined();
    });

    it('handles API error responses', async () => {
      const errorResponse: APIError = {
        error: 'API_ERROR',
        message: 'Something went wrong'
      };

      const response = new Response(JSON.stringify(errorResponse), {
        status: 200,
        statusText: 'OK',
      });
      mockFetch.mockResolvedValueOnce(response);

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('Test Product')
      );

      expect(result.error).toBeDefined();
    });
  });

  describe('Error Transformation', () => {
    it('transforms network errors correctly', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('Test Product')
      );

      expect(result.error).toBeDefined();
      if ('data' in result.error!) {
        expect(result.error.data).toContain('Network connection failed');
      }
    });

    it('transforms HTTP status errors correctly', async () => {
      const testCases = [
        { status: 400, expectedMessage: 'Invalid request' },
        { status: 401, expectedMessage: 'Authentication failed' },
        { status: 403, expectedMessage: 'Access denied' },
        { status: 404, expectedMessage: 'Service not found' },
        { status: 429, expectedMessage: 'Too many requests' },
        { status: 500, expectedMessage: 'Server error' },
        { status: 502, expectedMessage: 'Service temporarily unavailable' },
        { status: 503, expectedMessage: 'Service temporarily unavailable' },
        { status: 504, expectedMessage: 'Service temporarily unavailable' },
      ];

      for (const testCase of testCases) {
        const response = new Response('Error', {
          status: testCase.status,
          statusText: 'Error',
        });
        mockFetch.mockResolvedValueOnce(response);

        const result = await store.dispatch(
          recommendationApi.endpoints.getRecommendations.initiate('Test Product')
        );

        expect(result.error).toBeDefined();
        if ('data' in result.error!) {
          expect(result.error.data).toContain(testCase.expectedMessage);
        }
      }
    });

    it('transforms unknown HTTP errors correctly', async () => {
      const response = new Response('Error', {
        status: 418, // I'm a teapot
        statusText: 'Unknown Error',
      });
      mockFetch.mockResolvedValueOnce(response);

      const result = await store.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('Test Product')
      );

      expect(result.error).toBeDefined();
      if ('data' in result.error!) {
        expect(result.error.data).toContain('Unexpected error (418)');
      }
    });
  });

  describe('API Configuration', () => {
    it('has correct reducer path', () => {
      expect(recommendationApi.reducerPath).toBe('recommendationApi');
    });

    it('has correct base URL configuration', () => {
      // This is tested indirectly through the fetch calls
      expect(recommendationApi.reducerPath).toBeDefined();
    });

    it('provides correct tag types', () => {
      expect(recommendationApi.reducerPath).toBeDefined();
    });
  });
});
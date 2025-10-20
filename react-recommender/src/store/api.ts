import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RecommendationResponse, APIError, isAPIError } from '@ai-product-dashboard/shared-types';
const baseQueryWithRetry: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    timeout: 15000, // 15 second timeout
  });

  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 'FETCH_ERROR') {
    console.warn('Network error detected, retrying request...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    result = await baseQuery(args, api, extraOptions);
  }
  if (result.error && typeof result.error.status === 'number' && result.error.status >= 500) {
    console.warn(`Server error ${result.error.status} detected, retrying request...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};
export const recommendationApi = createApi({
  reducerPath: 'recommendationApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Recommendation'],
  endpoints: (builder) => ({
    getRecommendations: builder.query<RecommendationResponse, string>({
      query: (productName) => {
        if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
          throw new Error('Product name is required and must be a non-empty string');
        }

        return {
          url: '/recommendations',
          method: 'POST',
          body: { productName: productName.trim() },
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: ['Recommendation'],
      transformResponse: (response: unknown): RecommendationResponse => {
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format');
        }
        if (isAPIError(response)) {
          throw new Error(response.message || response.error);
        }

        const typedResponse = response as RecommendationResponse;
        
        // Validate recommendations array
        if (!typedResponse.recommendations || !Array.isArray(typedResponse.recommendations)) {
          throw new Error('Invalid recommendations format');
        }

        // Validate each recommendation
        const validRecommendations = typedResponse.recommendations.filter(rec => 
          rec && 
          typeof rec === 'object' && 
          typeof rec.name === 'string' && 
          typeof rec.reason === 'string' &&
          rec.name.trim().length > 0 &&
          rec.reason.trim().length > 0
        );

        if (validRecommendations.length === 0) {
          throw new Error('No valid recommendations received');
        }

        return {
          recommendations: validRecommendations
        };
      },
      transformErrorResponse: (response: FetchBaseQueryError): string => {
        console.error('API Error:', response);

        // Handle different types of errors
        if (response.status === 'FETCH_ERROR') {
          return 'Network connection failed. Please check your internet connection and try again.';
        }

        if (response.status === 'TIMEOUT_ERROR') {
          return 'Request timed out. The service may be temporarily unavailable.';
        }

        if (response.status === 'PARSING_ERROR') {
          return 'Invalid response from server. Please try again.';
        }

        if (typeof response.status === 'number') {
          switch (response.status) {
            case 400:
              return 'Invalid request. Please check your input and try again.';
            case 401:
              return 'Authentication failed. Please refresh the page and try again.';
            case 403:
              return 'Access denied. You may not have permission to access this feature.';
            case 404:
              return 'Service not found. The recommendation service may be temporarily unavailable.';
            case 429:
              return 'Too many requests. Please wait a moment and try again.';
            case 500:
              return 'Server error. Our team has been notified and is working on a fix.';
            case 502:
            case 503:
            case 504:
              return 'Service temporarily unavailable. Please try again in a few moments.';
            default:
              return `Unexpected error (${response.status}). Please try again.`;
          }
        }

        // Fallback error message
        return 'An unexpected error occurred. Please try again.';
      },
      // Cache recommendations for 5 minutes
      keepUnusedDataFor: 300,
    }),
  }),
});

// Export hooks for usage in components
export const { useGetRecommendationsQuery } = recommendationApi;
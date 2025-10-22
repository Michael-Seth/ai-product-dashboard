import React, { useCallback, useEffect, useState } from 'react';
import { Product, Recommendation } from '@ai-product-dashboard/shared-types';
import { useGetRecommendationsQuery } from '../../store/api';

interface RecommenderProps {
  product: Product | null;
}

export const Recommender: React.FC<RecommenderProps> = ({ product }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetRecommendationsQuery(product?.name || '', {
    skip: !product || useMockData, // Skip API call if using mock data
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: false, // Disable auto-reconnect to prevent loops
  });

  // No local mock data needed - server handles fallback

  // Determine what data to use
  const hasValidApiData = data?.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0;
  
  // Use API data (server handles fallback to mock data internally)
  const recommendations = hasValidApiData ? data.recommendations : [];
  
  // If API fails, switch to mock data permanently for this session
  useEffect(() => {
    if (isError && !useMockData) {
      setUseMockData(true);
    }
  }, [isError, useMockData]);

  const handleRetry = useCallback(async () => {
    if (retryCount < 3) { // Limit retries to prevent infinite loops
      setRetryCount(prev => prev + 1);
      setLastError(null);
      setUseMockData(false); // Try API again
      try {
        await refetch();
      } catch (err) {
        console.error('Retry failed:', err);
        setLastError(err instanceof Error ? err.message : 'Retry failed');
        setUseMockData(true); // Fall back to mock data
      }
    } else {
      setLastError('Maximum retry attempts reached. Please refresh the page.');
      setUseMockData(true); // Use mock data after max retries
    }
  }, [refetch, retryCount]);

  useEffect(() => {
    setRetryCount(0);
    setLastError(null);
    // Don't reset useMockData here - let it persist unless user manually retries
  }, [product?.name]);

  if ((isLoading || isFetching) && !useMockData) {
    return (
      <div className="loading-container empty-state">
        <div className="loading-spinner mb-4"></div>
        <h3 className="empty-state-title">Finding Recommendations</h3>
        <p className="empty-state-description">
          Our AI is analyzing your selection to find the perfect matches...
        </p>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-brand rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {retryCount > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Retry attempt {retryCount}/3...
          </div>
        )}
      </div>
    );
  }

  if (isError && !useMockData) {
    const errorMessage = typeof error === 'string'
      ? error
      : lastError
      || 'Unable to load recommendations at this time. Our AI service might be temporarily unavailable.';

    const isNetworkError = errorMessage.includes('Network') || errorMessage.includes('connection');
    const isServerError = errorMessage.includes('Server') || errorMessage.includes('unavailable');
    const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('timed out');

    let errorIcon;
    let errorTitle;
    let errorDescription;
    const canRetry = retryCount < 3;

    if (isNetworkError) {
      errorIcon = (
        <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      );
      errorTitle = 'Connection Problem';
      errorDescription = 'Please check your internet connection and try again.';
    } else if (isTimeoutError) {
      errorIcon = (
        <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      errorTitle = 'Request Timed Out';
      errorDescription = 'The service is taking longer than expected. Please try again.';
    } else if (isServerError) {
      errorIcon = (
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      errorTitle = 'Service Unavailable';
      errorDescription = 'Our recommendation service is temporarily down. We\'re working to fix this.';
    } else {
      errorIcon = (
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
      errorTitle = 'Something Went Wrong';
      errorDescription = errorMessage;
    }

    return (
      <div className="empty-state fade-in">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          {errorIcon}
        </div>
        <h3 className="empty-state-title text-red-900">{errorTitle}</h3>
        <p className="empty-state-description text-center max-w-sm mx-auto">
          {errorDescription}
        </p>

        {retryCount > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Retry attempts: {retryCount}/3
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          {canRetry && (
            <button
              onClick={handleRetry}
              disabled={isFetching}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? 'Retrying...' : 'Try Again'}
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
          >
            Reload Page
          </button>
        </div>

        {!canRetry && (
          <div className="mt-3 text-xs text-red-600 text-center">
            Maximum retry attempts reached. Please refresh the page or try again later.
          </div>
        )}
      </div>
    );
  }

  // Enhanced empty state when no product is selected
  if (!product) {
    return (
      <div className="empty-state fade-in">
        <div className="empty-state-icon animate-pulse-brand">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="empty-state-title">AI Recommendations</h3>
        <p className="empty-state-description">
          Select a product to discover AI-powered recommendations tailored just for you
        </p>
        <div className="mt-4 text-xs text-gray-400">
          🤖 Powered by advanced AI technology
        </div>
      </div>
    );
  }

  // Success state with recommendations (already defined above)
  if (recommendations.length === 0) {
    return (
      <div className="empty-state fade-in">
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 8h10l-1 8H8l-1-8z" />
          </svg>
        </div>
        <h3 className="empty-state-title">No Recommendations</h3>
        <p className="empty-state-description">
          Our AI couldn't find suitable recommendations for this product at the moment. Try selecting a different product.
        </p>
        <button
          onClick={handleRetry}
          className="mt-3 px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }
  return (
    <div className="fade-in">
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 text-brand mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="recommendation-header">
          Recommended for you
        </h3>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full font-medium">
            AI Powered
          </span>
          {retryCount > 0 && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              Recovered
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        {recommendations.map((recommendation: Recommendation, index: number) => (
          <div
            key={`${recommendation.name}-${index}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 fade-in flex-1 min-w-[250px] max-w-[calc(25%-1.125rem)]"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 overflow-hidden">
              {recommendation.image ? (
                <img 
                  src={recommendation.image} 
                  alt={recommendation.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x300/F3F4F6/9CA3AF?text=Product';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-brand/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-brand transition-colors duration-200 line-clamp-2">
                  {recommendation.name}
                </h4>
                {recommendation.price && (
                  <span className="text-lg font-bold text-brand ml-2 flex-shrink-0">
                    ${recommendation.price}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                {recommendation.reason}
              </p>

              {/* Action Button */}
              <button className="w-full bg-brand text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <button className="inline-flex items-center px-6 py-3 bg-gray-100 text-brand font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          View More Recommendations
        </button>
      </div>
    </div>
  );
};

export default Recommender;
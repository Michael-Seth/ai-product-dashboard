import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { recommendationApi } from '../../store/api';
import { Recommender } from './Recommender';
import { Product } from '@ai-product-dashboard/shared-types';
const createMockStore = (mockApi: any) => {
  return configureStore({
    reducer: {
      [recommendationApi.reducerPath]: mockApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(mockApi.middleware),
  });
};
const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'Test description',
  price: 100,
  imageUrl: 'test.jpg'
};

describe('Recommender Error Handling', () => {
  it('displays loading state correctly', () => {
    const mockApi = {
      ...recommendationApi,
      reducer: jest.fn(() => ({})),
      middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
    };
    jest.spyOn(require('../../store/api'), 'useGetRecommendationsQuery').mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
      isFetching: false,
    });

    const store = createMockStore(mockApi);

    render(
      <Provider store={store}>
        <Recommender product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Finding Recommendations')).toBeInTheDocument();
    expect(screen.getByText(/Our AI is analyzing your selection/)).toBeInTheDocument();
  });

  it('displays network error with retry option', async () => {
    const mockRefetch = jest.fn();
    const mockApi = {
      ...recommendationApi,
      reducer: jest.fn(() => ({})),
      middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
    };

    jest.spyOn(require('../../store/api'), 'useGetRecommendationsQuery').mockReturnValue({
      data: undefined,
      error: 'Network connection failed. Please check your internet connection and try again.',
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
      isFetching: false,
    });

    const store = createMockStore(mockApi);

    render(
      <Provider store={store}>
        <Recommender product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Connection Problem')).toBeInTheDocument();
    expect(screen.getByText(/Please check your internet connection/)).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('displays timeout error with appropriate message', () => {
    const mockApi = {
      ...recommendationApi,
      reducer: jest.fn(() => ({})),
      middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
    };

    jest.spyOn(require('../../store/api'), 'useGetRecommendationsQuery').mockReturnValue({
      data: undefined,
      error: 'Request timed out. The service is taking longer than expected.',
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
      isFetching: false,
    });

    const store = createMockStore(mockApi);

    render(
      <Provider store={store}>
        <Recommender product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Request Timed Out')).toBeInTheDocument();
    expect(screen.getByText(/taking longer than expected/)).toBeInTheDocument();
  });

  it('displays server error with appropriate message', () => {
    const mockApi = {
      ...recommendationApi,
      reducer: jest.fn(() => ({})),
      middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
    };

    jest.spyOn(require('../../store/api'), 'useGetRecommendationsQuery').mockReturnValue({
      data: undefined,
      error: 'Server error. Our team has been notified and is working on a fix.',
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
      isFetching: false,
    });

    const store = createMockStore(mockApi);

    render(
      <Provider store={store}>
        <Recommender product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Service Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/temporarily down/)).toBeInTheDocument();
  });

  it('shows empty state when no product is selected', () => {
    const mockApi = {
      ...recommendationApi,
      reducer: jest.fn(() => ({})),
      middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
    };

    jest.spyOn(require('../../store/api'), 'useGetRecommendationsQuery').mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isFetching: false,
    });

    const store = createMockStore(mockApi);

    render(
      <Provider store={store}>
        <Recommender product={null} />
      </Provider>
    );

    expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
    expect(screen.getByText(/Select a product to discover/)).toBeInTheDocument();
  });

  it('shows no recommendations state when empty array returned', () => {
    const mockApi = {
      ...recommendationApi,
      reducer: jest.fn(() => ({})),
      middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
    };

    jest.spyOn(require('../../store/api'), 'useGetRecommendationsQuery').mockReturnValue({
      data: { recommendations: [] },
      error: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isFetching: false,
    });

    const store = createMockStore(mockApi);

    render(
      <Provider store={store}>
        <Recommender product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('No Recommendations')).toBeInTheDocument();
    expect(screen.getByText(/couldn't find suitable recommendations/)).toBeInTheDocument();
  });

  it('limits retry attempts and shows appropriate message', async () => {
    const mockRefetch = jest.fn();
    const mockApi = {
      ...recommendationApi,
      reducer: jest.fn(() => ({})),
      middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
    };

    const { rerender } = render(
      <Provider store={createMockStore(mockApi)}>
        <Recommender product={mockProduct} />
      </Provider>
    );

    // Simulate multiple failed retries
    for (let i = 0; i < 4; i++) {
      jest.spyOn(require('../../store/api'), 'useGetRecommendationsQuery').mockReturnValue({
        data: undefined,
        error: 'Network error',
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
        isFetching: false,
      });

      rerender(
        <Provider store={createMockStore(mockApi)}>
          <Recommender product={mockProduct} />
        </Provider>
      );

      const retryButton = screen.queryByText('Try Again');
      if (retryButton) {
        fireEvent.click(retryButton);
      }
    }

    // After 3 retries, should show max retry message
    await waitFor(() => {
      expect(screen.getByText(/Maximum retry attempts reached/)).toBeInTheDocument();
    });
  });

  it('displays successful recommendations correctly', () => {
    const mockRecommendations = [
      { name: 'Product 1', reason: 'Great for productivity' },
      { name: 'Product 2', reason: 'Perfect companion device' }
    ];

    const mockApi = {
      ...recommendationApi,
      reducer: jest.fn(() => ({})),
      middleware: jest.fn(() => (next: any) => (action: any) => next(action)),
    };

    jest.spyOn(require('../../store/api'), 'useGetRecommendationsQuery').mockReturnValue({
      data: { recommendations: mockRecommendations },
      error: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isFetching: false,
    });

    const store = createMockStore(mockApi);

    render(
      <Provider store={store}>
        <Recommender product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Recommended for you')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Great for productivity')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Perfect companion device')).toBeInTheDocument();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
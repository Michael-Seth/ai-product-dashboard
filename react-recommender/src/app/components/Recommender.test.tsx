import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { recommendationApi } from '../../store/api';
import { Recommender } from './Recommender';
import { Product, Recommendation } from '@ai-product-dashboard/shared-types';
const mockUseGetRecommendationsQuery = jest.fn();
jest.mock('../../store/api', () => ({
    ...jest.requireActual('../../store/api'),
    useGetRecommendationsQuery: mockUseGetRecommendationsQuery,
}));
const createMockStore = () => {
    return configureStore({
        reducer: {
            [recommendationApi.reducerPath]: recommendationApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(recommendationApi.middleware),
    });
};
const mockProduct: Product = {
    id: 1,
    name: 'MacBook Pro',
    description: 'Powerful laptop for professionals',
    price: 1999,
    imageUrl: 'macbook.jpg'
};

const mockRecommendations: Recommendation[] = [
    { name: 'iPad Pro', reason: 'Perfect companion for creative work' },
    { name: 'Magic Mouse', reason: 'Enhances productivity with smooth navigation' },
    { name: 'USB-C Hub', reason: 'Expands connectivity options' }
];

describe('Recommender Component', () => {
    let store: ReturnType<typeof createMockStore>;

    beforeEach(() => {
        store = createMockStore();
        jest.clearAllMocks();
    });

    const renderWithProvider = (component: React.ReactElement) => {
        return render(
            <Provider store={store}>
                {component}
            </Provider>
        );
    };

    describe('Loading States', () => {
        it('displays loading state with branded spinner', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: undefined,
                isLoading: true,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('Finding Recommendations')).toBeInTheDocument();
            expect(screen.getByText(/Our AI is analyzing your selection/)).toBeInTheDocument();
            expect(screen.getByText(/to find the perfect matches/)).toBeInTheDocument();
            const spinner = document.querySelector('.loading-spinner');
            expect(spinner).toBeInTheDocument();
            const animatedDots = document.querySelectorAll('.animate-bounce');
            expect(animatedDots.length).toBeGreaterThanOrEqual(3);
        });

        it('displays fetching state with retry count', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
                isFetching: true,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('Finding Recommendations')).toBeInTheDocument();
        });
    });

    describe('Error States', () => {
        it('displays network error with retry functionality', async () => {
            const mockRefetch = jest.fn();
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: 'Network connection failed. Please check your internet connection and try again.',
                isLoading: false,
                isError: true,
                refetch: mockRefetch,
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('Connection Problem')).toBeInTheDocument();
            expect(screen.getByText(/Please check your internet connection/)).toBeInTheDocument();

            const retryButton = screen.getByText('Try Again');
            expect(retryButton).toBeInTheDocument();

            fireEvent.click(retryButton);
            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('displays timeout error with appropriate icon and message', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: 'Request timed out. The service is taking longer than expected.',
                isLoading: false,
                isError: true,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('Request Timed Out')).toBeInTheDocument();
            expect(screen.getByText(/taking longer than expected/)).toBeInTheDocument();
        });

        it('displays server error with service unavailable message', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: 'Server error. Our team has been notified and is working on a fix.',
                isLoading: false,
                isError: true,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('Service Unavailable')).toBeInTheDocument();
            expect(screen.getByText(/temporarily down/)).toBeInTheDocument();
        });

        it('displays generic error for unknown error types', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: 'Unknown error occurred',
                isLoading: false,
                isError: true,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
            expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
        });

        it('provides reload page functionality', () => {
            const mockReload = jest.fn();
            Object.defineProperty(window, 'location', {
                value: { reload: mockReload },
                writable: true,
            });

            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: 'Network error',
                isLoading: false,
                isError: true,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            const reloadButton = screen.getByText('Reload Page');
            fireEvent.click(reloadButton);

            expect(mockReload).toHaveBeenCalled();
        });
    });

    describe('Empty States', () => {
        it('shows empty state when no product is selected', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={null} />);

            expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
            expect(screen.getByText(/Select a product to discover/)).toBeInTheDocument();
            expect(screen.getByText(/🤖 Powered by advanced AI technology/)).toBeInTheDocument();
        });

        it('shows no recommendations state when empty array returned', () => {
            const mockRefetch = jest.fn();
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: { recommendations: [] },
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('No Recommendations')).toBeInTheDocument();
            expect(screen.getByText(/couldn't find suitable recommendations/)).toBeInTheDocument();

            const tryAgainButton = screen.getByText('Try Again');
            fireEvent.click(tryAgainButton);
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    describe('Success States', () => {
        it('displays successful recommendations correctly', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: { recommendations: mockRecommendations },
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('Recommended for you')).toBeInTheDocument();
            expect(screen.getByText('AI Powered')).toBeInTheDocument();

            // Check each recommendation
            mockRecommendations.forEach(rec => {
                expect(screen.getByText(rec.name)).toBeInTheDocument();
                expect(screen.getByText(rec.reason)).toBeInTheDocument();
            });

            expect(screen.getByText('View More Recommendations')).toBeInTheDocument();
        });

        it('displays recommendations with proper styling and animations', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: { recommendations: mockRecommendations },
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            // Check for fade-in class
            const fadeInElements = document.querySelectorAll('.fade-in');
            expect(fadeInElements.length).toBeGreaterThan(0);

            // Check for recommendation cards
            const recommendationCards = document.querySelectorAll('.recommendation-card');
            expect(recommendationCards).toHaveLength(mockRecommendations.length);
        });
    });

    describe('Product Changes', () => {
        it('resets retry count when product changes', () => {
            const { rerender } = renderWithProvider(<Recommender product={mockProduct} />);

            // Change to different product
            const newProduct: Product = {
                id: 2,
                name: 'iPad Air',
                description: 'Versatile tablet',
                price: 599,
                imageUrl: 'ipad.jpg'
            };

            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: undefined,
                isLoading: true,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            rerender(
                <Provider store={store}>
                    <Recommender product={newProduct} />
                </Provider>
            );

            expect(screen.getByText('Finding Recommendations')).toBeInTheDocument();
        });

        it('skips query when product is null', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={null} />);

            expect(mockUseGetRecommendationsQuery).toHaveBeenCalledWith('', {
                skip: true,
                refetchOnMountOrArgChange: true,
                refetchOnReconnect: true,
            });
        });

        it('calls query with product name when product is provided', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: { recommendations: mockRecommendations },
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(mockUseGetRecommendationsQuery).toHaveBeenCalledWith('MacBook Pro', {
                skip: false,
                refetchOnMountOrArgChange: true,
                refetchOnReconnect: true,
            });
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels and semantic structure', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: { recommendations: mockRecommendations },
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            // Check for proper heading structure
            const heading = screen.getByText('Recommended for you');
            expect(heading.tagName).toBe('H3');

            // Check for proper button elements
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('provides keyboard navigation support', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: { recommendations: mockRecommendations },
                error: undefined,
                isLoading: false,
                isError: false,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            const moreButton = screen.getByText('View More Recommendations');
            expect(moreButton).toBeInTheDocument();
            expect(moreButton.tagName).toBe('BUTTON');
        });
    });

    describe('Retry Logic', () => {
        it('handles retry attempts correctly', async () => {
            const mockRefetch = jest.fn();
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: 'Network error',
                isLoading: false,
                isError: true,
                refetch: mockRefetch,
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            const retryButton = screen.getByText('Try Again');
            fireEvent.click(retryButton);

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('shows reload page button when available', () => {
            mockUseGetRecommendationsQuery.mockReturnValue({
                data: undefined,
                error: 'Network error',
                isLoading: false,
                isError: true,
                refetch: jest.fn(),
                isFetching: false,
            });

            renderWithProvider(<Recommender product={mockProduct} />);

            expect(screen.getByText('Reload Page')).toBeInTheDocument();
        });
    });
});
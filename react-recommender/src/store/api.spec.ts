import { recommendationApi, useGetRecommendationsQuery } from './api';

describe('recommendationApi', () => {
  it('should have the correct reducer path', () => {
    expect(recommendationApi.reducerPath).toBe('recommendationApi');
  });

  it('should have getRecommendations endpoint', () => {
    expect(recommendationApi.endpoints.getRecommendations).toBeDefined();
  });

  it('should export useGetRecommendationsQuery hook', () => {
    expect(useGetRecommendationsQuery).toBeDefined();
    expect(typeof useGetRecommendationsQuery).toBe('function');
  });
});
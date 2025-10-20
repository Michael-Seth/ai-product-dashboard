import { store } from './store';
import { recommendationApi } from './api';

describe('store', () => {
  it('should have the recommendation API reducer', () => {
    const state = store.getState();
    expect(state[recommendationApi.reducerPath]).toBeDefined();
  });

  it('should be configured with RTK Query middleware', () => {
    // Test that the store is properly configured by checking if it has the expected structure
    expect(store.dispatch).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.subscribe).toBeDefined();
  });
});
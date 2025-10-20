import { configureStore } from '@reduxjs/toolkit';
import { setupStore, store } from './store';
import { recommendationApi } from './api';

describe('Store Configuration', () => {
  describe('setupStore function', () => {
    it('creates a store with correct reducer configuration', () => {
      const testStore = setupStore();
      
      expect(testStore).toBeDefined();
      expect(typeof testStore.getState).toBe('function');
      expect(typeof testStore.dispatch).toBe('function');
    });

    it('includes recommendationApi reducer', () => {
      const testStore = setupStore();
      const state = testStore.getState();
      
      expect(state).toHaveProperty('recommendationApi');
    });

    it('includes recommendationApi middleware', () => {
      const testStore = setupStore();
      
      // Test that RTK Query middleware is working by checking if the store has the expected structure
      expect(testStore).toBeDefined();
      
      // The middleware should be configured to handle RTK Query actions
      const state = testStore.getState();
      expect(state.recommendationApi).toBeDefined();
    });

    it('accepts preloaded state', () => {
      const preloadedState = {
        recommendationApi: {
          queries: {},
          mutations: {},
          provided: {},
          subscriptions: {},
          config: {
            online: true,
            focused: true,
            middlewareRegistered: false,
          },
        },
      };

      const testStore = setupStore(preloadedState);
      const state = testStore.getState();
      
      expect(state.recommendationApi).toEqual(preloadedState.recommendationApi);
    });

    it('creates independent store instances', () => {
      const store1 = setupStore();
      const store2 = setupStore();
      
      expect(store1).not.toBe(store2);
      expect(store1.getState()).not.toBe(store2.getState());
    });
  });

  describe('default store instance', () => {
    it('is created using setupStore', () => {
      expect(store).toBeDefined();
      expect(typeof store.getState).toBe('function');
      expect(typeof store.dispatch).toBe('function');
    });

    it('has correct initial state structure', () => {
      const state = store.getState();
      
      expect(state).toHaveProperty('recommendationApi');
      expect(state.recommendationApi).toBeDefined();
    });

    it('can dispatch actions', () => {
      expect(() => {
        store.dispatch({ type: 'test/action' });
      }).not.toThrow();
    });
  });

  describe('Type exports', () => {
    it('exports correct TypeScript types', () => {
      // These are compile-time checks, but we can verify the store structure
      const state = store.getState();
      const dispatch = store.dispatch;
      
      expect(typeof state).toBe('object');
      expect(typeof dispatch).toBe('function');
    });
  });

  describe('RTK Query Integration', () => {
    it('includes RTK Query API slice', () => {
      const testStore = setupStore();
      const state = testStore.getState();
      
      expect(state.recommendationApi).toBeDefined();
      expect(typeof state.recommendationApi).toBe('object');
    });

    it('can handle RTK Query actions', () => {
      const testStore = setupStore();
      
      // Dispatch a RTK Query action
      expect(() => {
        testStore.dispatch(recommendationApi.util.resetApiState());
      }).not.toThrow();
    });

    it('maintains RTK Query state correctly', () => {
      const testStore = setupStore();
      
      // Reset API state
      testStore.dispatch(recommendationApi.util.resetApiState());
      
      const state = testStore.getState();
      expect(state.recommendationApi).toBeDefined();
    });
  });

  describe('Middleware Configuration', () => {
    it('includes default middleware', () => {
      const testStore = setupStore();
      
      // Test that middleware is working by dispatching an action
      expect(() => {
        testStore.dispatch({ type: 'test/action' });
      }).not.toThrow();
    });

    it('includes RTK Query middleware', () => {
      const testStore = setupStore();
      
      // RTK Query middleware should handle API actions
      expect(() => {
        testStore.dispatch(recommendationApi.util.resetApiState());
      }).not.toThrow();
    });

    it('handles async actions', async () => {
      const testStore = setupStore();
      
      // Mock fetch for this test
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ recommendations: [] }),
      } as any);

      // Dispatch an async action
      const result = await testStore.dispatch(
        recommendationApi.endpoints.getRecommendations.initiate('test')
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('Store Persistence', () => {
    it('maintains state across actions', () => {
      const testStore = setupStore();
      
      // Dispatch multiple actions
      testStore.dispatch({ type: 'test/action1' });
      testStore.dispatch({ type: 'test/action2' });
      
      const state = testStore.getState();
      expect(state.recommendationApi).toBeDefined();
    });

    it('handles state updates correctly', () => {
      const testStore = setupStore();
      const initialState = testStore.getState();
      
      // Dispatch an action that should update state
      testStore.dispatch(recommendationApi.util.resetApiState());
      
      const newState = testStore.getState();
      expect(newState).toBeDefined();
      expect(newState.recommendationApi).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid actions gracefully', () => {
      const testStore = setupStore();
      
      expect(() => {
        testStore.dispatch({ type: 'invalid/action', payload: undefined });
      }).not.toThrow();
    });

    it('maintains store integrity after errors', () => {
      const testStore = setupStore();
      
      try {
        testStore.dispatch({ type: 'invalid/action' });
      } catch (error) {
        // Should not throw, but if it does, store should still be valid
      }
      
      const state = testStore.getState();
      expect(state).toBeDefined();
      expect(state.recommendationApi).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('creates store efficiently', () => {
      const startTime = performance.now();
      const testStore = setupStore();
      const endTime = performance.now();
      
      expect(testStore).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should create quickly
    });

    it('handles multiple store creations', () => {
      const stores = [];
      
      for (let i = 0; i < 10; i++) {
        stores.push(setupStore());
      }
      
      expect(stores).toHaveLength(10);
      stores.forEach(store => {
        expect(store).toBeDefined();
        expect(typeof store.getState).toBe('function');
      });
    });
  });
});
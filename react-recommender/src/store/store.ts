import { configureStore } from '@reduxjs/toolkit';
import { recommendationApi } from './api';

// Store configuration function for Web Component usage
export const setupStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      recommendationApi: recommendationApi.reducer,
    } as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(recommendationApi.middleware),
    preloadedState,
  });
};

// Default store instance
export const store = setupStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof setupStore>;
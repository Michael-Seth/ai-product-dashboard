import { configureStore } from '@reduxjs/toolkit';
import { recommendationApi } from './api';
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
export const store = setupStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof setupStore>;
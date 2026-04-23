import { configureStore } from '@reduxjs/toolkit';
import repoReducer from './repoSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    repos: repoReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

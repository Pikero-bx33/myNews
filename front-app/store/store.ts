import { configureStore } from '@reduxjs/toolkit';

import articleStatesReducer from './article-states-slice';

export const store = configureStore({
  reducer: {
    articleStates: articleStatesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

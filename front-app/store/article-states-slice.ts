import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ArticleUserState } from '@/lib/api/articles';

type ArticleStatesState = {
  byId: Record<string, ArticleUserState>;
};

type ArticleStateSource = {
  id: string;
  userState: ArticleUserState;
};

const initialState: ArticleStatesState = {
  byId: {},
};

const articleStatesSlice = createSlice({
  initialState,
  name: 'articleStates',
  reducers: {
    hydrateArticleStates: (state, action: PayloadAction<Record<string, ArticleUserState>>) => {
      Object.assign(state.byId, action.payload);
    },
    setArticleState: (
      state,
      action: PayloadAction<{ articleId: string; userState: ArticleUserState }>,
    ) => {
      state.byId[action.payload.articleId] = action.payload.userState;
    },
  },
});

export const toArticleStatesById = (articles: ArticleStateSource[]) =>
  articles.reduce<Record<string, ArticleUserState>>((statesById, article) => {
    statesById[article.id] = article.userState;
    return statesById;
  }, {});

export const { hydrateArticleStates, setArticleState } = articleStatesSlice.actions;

export default articleStatesSlice.reducer;

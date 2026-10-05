import { Types } from "mongoose";

import type { UserArticleState } from "../models/userArticleState.js";
import { UserArticleStateModel } from "../models/userArticleState.js";
import type {
  ArticleUserState,
  FeedArticle,
  FeedArticleWithUserState,
} from "../types/article.js";

export const emptyArticleUserState = (): ArticleUserState => ({
  isFavorite: false,
  isRead: false,
  savedAt: null,
  readAt: null,
});

export const serializeArticleUserState = (
  state: Pick<UserArticleState, "isFavorite" | "isRead" | "savedAt" | "readAt">,
): ArticleUserState => ({
  isFavorite: state.isFavorite,
  isRead: state.isRead,
  savedAt: state.savedAt?.toISOString() ?? null,
  readAt: state.readAt?.toISOString() ?? null,
});

export const getArticleUserStateMap = async (
  userId: string,
  articleIds: string[],
): Promise<Map<string, ArticleUserState>> => {
  if (articleIds.length === 0) {
    return new Map();
  }

  const states = await UserArticleStateModel.find({
    userId,
    articleId: { $in: articleIds.map((articleId) => new Types.ObjectId(articleId)) },
  }).lean();

  return new Map(
    states.map((state) => [
      state.articleId.toString(),
      serializeArticleUserState(state),
    ]),
  );
};

export const addUserStatesToFeed = async (
  userId: string,
  articles: FeedArticle[],
): Promise<FeedArticleWithUserState[]> => {
  const statesByArticleId = await getArticleUserStateMap(
    userId,
    articles.map((article) => article.id),
  );

  return articles.map((article) => ({
    ...article,
    userState: statesByArticleId.get(article.id) ?? emptyArticleUserState(),
  }));
};

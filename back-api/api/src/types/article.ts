export type NormalizedArticle = {
  articleUrl: string;
  description: string | null;
  externalId: string;
  imageUrl: string | null;
  language: string;
  provider: "thenewsapi";
  publishedAt: string;
  sourceDomain: string;
  sourceName: string;
  title: string;
  topics: string[];
};

export type FeedArticle = NormalizedArticle & {
  id: string;
};

export type ArticleUserState = {
  isFavorite: boolean;
  isRead: boolean;
  savedAt: string | null;
  readAt: string | null;
};

export type FeedArticleWithUserState = FeedArticle & {
  userState: ArticleUserState;
};

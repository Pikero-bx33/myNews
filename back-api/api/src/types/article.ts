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

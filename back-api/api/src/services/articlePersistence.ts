import type { Article } from "../models/article.js";
import { ArticleModel } from "../models/article.js";
import type { FeedArticle, NormalizedArticle } from "../types/article.js";
import type { Types } from "mongoose";

type PersistedArticle = Article & { _id: Types.ObjectId };

const articleKey = (provider: string, externalId: string) =>
  `${provider}:${externalId}`;

export const persistFeedArticles = async (
  articles: NormalizedArticle[],
): Promise<FeedArticle[]> => {
  if (articles.length === 0) {
    return [];
  }

  const fetchedAt = new Date();

  await ArticleModel.bulkWrite(
    articles.map((article) => ({
      updateOne: {
        filter: { provider: article.provider, externalId: article.externalId },
        update: {
          $set: {
            ...article,
            publishedAt: new Date(article.publishedAt),
            fetchedAt,
          },
        },
        upsert: true,
      },
    })),
  );

  const persistedArticles = await ArticleModel.find({
    $or: articles.map((article) => ({
      provider: article.provider,
      externalId: article.externalId,
    })),
  }).lean();

  const articlesByKey = new Map(
    persistedArticles.map((article) => [
      articleKey(article.provider, article.externalId),
      article,
    ]),
  );

  return articles.map((article) => {
    const persistedArticle = articlesByKey.get(
      articleKey(article.provider, article.externalId),
    );

    if (!persistedArticle) {
      throw new Error("Persisted article could not be found");
    }

    return serializeArticle(persistedArticle);
  });
};

export const serializeArticle = (article: PersistedArticle): FeedArticle => ({
  id: article._id.toString(),
  externalId: article.externalId,
  provider: article.provider,
  title: article.title,
  description: article.description,
  articleUrl: article.articleUrl,
  imageUrl: article.imageUrl,
  sourceName: article.sourceName,
  sourceDomain: article.sourceDomain,
  publishedAt: article.publishedAt.toISOString(),
  language: article.language,
  topics: article.topics,
});

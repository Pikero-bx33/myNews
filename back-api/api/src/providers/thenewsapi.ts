import { env } from "../config/env.js";
import {
  theNewsApiErrorResponseSchema,
  theNewsApiResponseSchema,
} from "../schemas/thenewsapi.js";
import type { ContentLanguage } from "../models/userPreferences.js";
import type { NormalizedArticle } from "../types/article.js";

export const myNewsTopicToTheNewsApiCategory = {
  business: "business",
  cinema: "entertainment",
  culture: "entertainment",
  food: "food",
  health: "health",
  politics: "politics",
  science: "science",
  sport: "sports",
  technology: "tech",
} as const;

const theNewsApiCategoryToMyNewsTopics = {
  business: ["business"],
  entertainment: ["cinema", "culture"],
  food: ["food"],
  health: ["health"],
  politics: ["politics"],
  science: ["science"],
  sports: ["sport"],
  tech: ["technology"],
} as const;

const THE_NEWS_API_ALL_NEWS_URL = "https://api.thenewsapi.com/v1/news/all";
export const FEED_LIMIT = 3;

export const toTheNewsApiLanguageParameter = (languages: ("fr" | "en")[]) =>
  languages.join(",");

type FeedPreferences = {
  blockedSources: string[];
  contentLanguages: ContentLanguage[];
  keywords: string[];
  preferredSources: string[];
  topics: string[];
};

export class TheNewsApiError extends Error {
  constructor(
    public readonly status: number,
  ) {
    super("TheNewsAPI request failed");
  }
}

const uniqueValues = (values: string[]) => [...new Set(values)];

const toTheNewsApiCategories = (topics: string[]) =>
  uniqueValues(
    topics.flatMap((topic) => {
      const category = myNewsTopicToTheNewsApiCategory[
        topic as keyof typeof myNewsTopicToTheNewsApiCategory
      ];

      return category ? [category] : [];
    }),
  );

export const buildTheNewsApiFeedUrl = (preferences: FeedPreferences): URL => {
  const url = new URL(THE_NEWS_API_ALL_NEWS_URL);
  const categories = toTheNewsApiCategories(preferences.topics);

  url.searchParams.set("api_token", env.theNewsApiKey);
  url.searchParams.set("limit", String(FEED_LIMIT));

  if (preferences.contentLanguages.length > 0) {
    url.searchParams.set(
      "language",
      toTheNewsApiLanguageParameter(preferences.contentLanguages),
    );
  }

  if (categories.length > 0) {
    url.searchParams.set("categories", categories.join(","));
  }

  if (preferences.keywords.length > 0) {
    url.searchParams.set("search", preferences.keywords.join(" | "));
  }

  if (preferences.preferredSources.length > 0) {
    url.searchParams.set("domains", preferences.preferredSources.join(","));
  }

  if (preferences.blockedSources.length > 0) {
    url.searchParams.set(
      "exclude_domains",
      preferences.blockedSources.join(","),
    );
  }

  return url;
};

const normalizeTheNewsApiCategories = (categories: string[]): string[] =>
  uniqueValues(
    categories.flatMap(
      (category) =>
        theNewsApiCategoryToMyNewsTopics[
          category as keyof typeof theNewsApiCategoryToMyNewsTopics
        ] ?? [],
    ),
  );

export const normalizeTheNewsApiArticle = (
  article: typeof theNewsApiResponseSchema.shape.data.element._output,
): NormalizedArticle => ({
  externalId: article.uuid,
  provider: "thenewsapi",
  title: article.title,
  description: article.description,
  articleUrl: article.url,
  imageUrl: article.image_url,
  sourceName: article.source,
  sourceDomain: article.source,
  publishedAt: article.published_at,
  language: article.language,
  topics: normalizeTheNewsApiCategories(article.categories),
});

export const getTheNewsApiFeed = async (
  preferences: FeedPreferences,
): Promise<NormalizedArticle[]> => {
  const response = await fetch(buildTheNewsApiFeedUrl(preferences));
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const providerError = theNewsApiErrorResponseSchema.safeParse(body);
    const errorCode = providerError.success ? providerError.data.error.code : "unknown";
    console.error(`TheNewsAPI request failed: status ${response.status}, code ${errorCode}`);
    throw new TheNewsApiError(response.status);
  }

  const parsedResponse = theNewsApiResponseSchema.safeParse(body);

  if (!parsedResponse.success) {
    console.error("TheNewsAPI returned an invalid success response");
    throw new TheNewsApiError(502);
  }

  return parsedResponse.data.data.map(normalizeTheNewsApiArticle);
};

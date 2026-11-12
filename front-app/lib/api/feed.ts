import { getAuthHeaders } from '@/lib/api/preferences';
import { apiBaseUrl } from '@/lib/auth-client';
import type { ArticleUserState } from '@/lib/api/articles';

export type FeedArticle = {
  id: string;
  externalId: string;
  provider: 'thenewsapi';
  title: string;
  description: string | null;
  articleUrl: string;
  imageUrl: string | null;
  sourceName: string;
  sourceDomain: string;
  publishedAt: string;
  language: string;
  topics: string[];
  userState: ArticleUserState;
};

export type FeedResponse = {
  articles: FeedArticle[];
  pagination: {
    page: number;
    hasMore: boolean;
  };
};

export class FeedRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'FeedRequestError';
  }
}

const getErrorMessage = (status: number) => {
  if (status === 401) {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }

  if (status === 503) {
    return 'Impossible de charger vos actualités pour le moment. Réessayez plus tard.';
  }

  return 'Impossible de charger vos actualités. Réessayez.';
};

export async function getFeed(page = 1): Promise<FeedResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/feed?page=${page}`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new FeedRequestError(getErrorMessage(response.status), response.status);
  }

  return response.json() as Promise<FeedResponse>;
}

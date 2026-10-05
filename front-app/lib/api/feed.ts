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

type FeedResponse = {
  articles: FeedArticle[];
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

  return 'Impossible de charger vos actualités. Réessayez.';
};

export async function getFeed(): Promise<FeedArticle[]> {
  const response = await fetch(`${apiBaseUrl}/api/v1/feed`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new FeedRequestError(getErrorMessage(response.status), response.status);
  }

  const body: FeedResponse = await response.json();
  return body.articles;
}

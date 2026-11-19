import { apiBaseUrl } from '@/lib/auth-client';
import { getAuthenticatedRequestOptions } from '@/lib/api/authenticated-request';

import type { FeedArticle } from './feed';

type FavoritesResponse = {
  articles: FeedArticle[];
};

export async function getFavorites(): Promise<FeedArticle[]> {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/favorites`,
    await getAuthenticatedRequestOptions(),
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Votre session a expiré. Veuillez vous reconnecter.'
        : 'Impossible de charger vos articles enregistrés. Réessayez.',
    );
  }

  const body: FavoritesResponse = await response.json();
  return body.articles;
}

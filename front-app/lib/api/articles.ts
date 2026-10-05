import { apiBaseUrl } from '@/lib/auth-client';
import { getAuthHeaders } from '@/lib/api/preferences';

export type ArticleUserState = {
  isFavorite: boolean;
  isRead: boolean;
  savedAt: string | null;
  readAt: string | null;
};

export type ArticleStateUpdate = Pick<Partial<ArticleUserState>, 'isFavorite' | 'isRead'>;

type ArticleStateResponse = ArticleUserState & {
  articleId: string;
};

const getErrorMessage = (status: number) => {
  if (status === 401) {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }

  if (status === 404) {
    return 'Cet article n’est plus disponible.';
  }

  return 'Impossible de mettre à jour cet article. Réessayez.';
};

export async function updateArticleState(
  articleId: string,
  update: ArticleStateUpdate,
): Promise<ArticleUserState> {
  const response = await fetch(`${apiBaseUrl}/api/v1/articles/${articleId}/state`, {
    body: JSON.stringify(update),
    headers: {
      ...(await getAuthHeaders()),
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  const body: ArticleStateResponse = await response.json();

  return {
    isFavorite: body.isFavorite,
    isRead: body.isRead,
    readAt: body.readAt,
    savedAt: body.savedAt,
  };
}

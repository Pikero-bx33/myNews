import { getAuthenticatedRequestOptions } from '@/lib/api/authenticated-request';
import { apiBaseUrl } from '@/lib/auth-client';

export type ContentLanguage = 'fr' | 'en';

export type UserPreferences = {
  blockedSources: string[];
  contentLanguages: ContentLanguage[];
  createdAt: string;
  keywords: string[];
  preferredSources: string[];
  topics: string[];
  updatedAt: string;
  userId: string;
};

export type UserPreferencesPayload = Pick<
  UserPreferences,
  'blockedSources' | 'contentLanguages' | 'keywords' | 'preferredSources' | 'topics'
>;

type PreferencesResponse = {
  preferences: UserPreferences | null;
};

const getErrorMessage = (status: number) => {
  if (status === 401) {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }

  if (status === 400) {
    return 'Certaines préférences sont invalides. Vérifiez vos choix.';
  }

  return 'Le service est indisponible. Réessayez dans quelques instants.';
};

export async function getPreferences(): Promise<UserPreferences | null> {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/preferences`,
    await getAuthenticatedRequestOptions(),
  );

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  const body: PreferencesResponse = await response.json();
  return body.preferences;
}

export async function savePreferences(payload: UserPreferencesPayload): Promise<UserPreferences> {
  const requestOptions = await getAuthenticatedRequestOptions();
  const response = await fetch(`${apiBaseUrl}/api/v1/preferences`, {
    ...requestOptions,
    body: JSON.stringify(payload),
    headers: {
      ...requestOptions.headers,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  return response.json();
}

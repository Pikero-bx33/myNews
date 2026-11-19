import { Platform } from 'react-native';

import { authClient } from '@/lib/auth-client';

export const getAuthenticatedRequestOptions = async () => {
  const headers = {
    Accept: 'application/json',
  };

  if (Platform.OS === 'web') {
    return {
      credentials: 'include' as const,
      headers,
    };
  }

  const cookie = await authClient.getCookie();

  if (!cookie) {
    throw new Error('Votre session est indisponible. Veuillez vous reconnecter.');
  }

  return {
    headers: {
      ...headers,
      Cookie: cookie,
    },
  };
};

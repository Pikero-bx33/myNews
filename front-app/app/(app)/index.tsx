import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { getPreferences } from '@/lib/api/preferences';

export default function AppIndex() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const preferences = await getPreferences();

        if (!isMounted) {
          return;
        }

        router.replace(preferences ? '/home' : '/onboarding/languages');
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de vérifier vos préférences. Réessayez.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.error}>{errorMessage}</Text>
      <Button onPress={() => setRetryCount((count) => count + 1)} title="Réessayer" />
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: '#EF4444',
    lineHeight: 22,
    textAlign: 'center',
  },
});

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/primary-button';
import { getPreferences } from '@/lib/api/preferences';
import { colors, spacing, typography } from '@/theme/tokens';

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
      <PrimaryButton label="Réessayer" onPress={() => setRetryCount((count) => count + 1)} />
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  error: {
    ...typography.bodySecondary,
    color: colors.error,
    textAlign: 'center',
  },
});

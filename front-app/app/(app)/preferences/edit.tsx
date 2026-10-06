import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectableChip } from '@/components/onboarding/selectable-chip';
import { KeywordEditor } from '@/components/preferences/keyword-editor';
import { contentLanguageOptions, topicOptions } from '@/components/preferences/options';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';
import {
  getPreferences,
  savePreferences,
  type ContentLanguage,
  type UserPreferences,
} from '@/lib/api/preferences';
import { colors, spacing, typography } from '@/theme/tokens';

export default function EditPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [contentLanguages, setContentLanguages] = useState<ContentLanguage[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const nextPreferences = await getPreferences();

        if (!isMounted) {
          return;
        }

        if (!nextPreferences) {
          setErrorMessage('Vos préférences sont introuvables. Veuillez relancer votre configuration.');
          return;
        }

        setPreferences(nextPreferences);
        setContentLanguages(nextPreferences.contentLanguages);
        setTopics(nextPreferences.topics);
        setKeywords(nextPreferences.keywords);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Impossible de charger vos préférences. Réessayez.',
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

  const toggleLanguage = (language: ContentLanguage) => {
    setContentLanguages((currentLanguages) =>
      currentLanguages.includes(language)
        ? currentLanguages.filter((item) => item !== language)
        : [...currentLanguages, language],
    );
  };

  const toggleTopic = (topic: string) => {
    setTopics((currentTopics) =>
      currentTopics.includes(topic)
        ? currentTopics.filter((item) => item !== topic)
        : [...currentTopics, topic],
    );
  };

  const saveEditedPreferences = async () => {
    if (!preferences) {
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await savePreferences({
        blockedSources: preferences.blockedSources,
        contentLanguages,
        keywords,
        preferredSources: preferences.preferredSources,
        topics,
      });
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Impossible d’enregistrer vos préférences. Réessayez.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.statusText}>Chargement de vos préférences…</Text>
      </View>
    );
  }

  if (errorMessage && !preferences) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.error}>{errorMessage}</Text>
        <PrimaryButton label="Réessayer" onPress={() => setRetryCount((count) => count + 1)} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Text style={styles.title}>Vos préférences</Text>
          <Text style={styles.description}>Affinez les actualités que vous souhaitez recevoir.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langues de contenu</Text>
          <View style={styles.choices}>
            {contentLanguageOptions.map((language) => (
              <SelectableChip
                key={language.value}
                label={language.label}
                onPress={() => toggleLanguage(language.value)}
                selected={contentLanguages.includes(language.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Centres d’intérêt</Text>
          <View style={styles.choices}>
            {topicOptions.map((topic) => (
              <SelectableChip
                key={topic.slug}
                label={topic.label}
                onPress={() => toggleTopic(topic.slug)}
                selected={topics.includes(topic.slug)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mots-clés</Text>
          <Text style={styles.description}>Facultatif : ajoutez des sujets plus précis.</Text>
          <KeywordEditor keywords={keywords} onChangeKeywords={setKeywords} />
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <PrimaryButton
          disabled={contentLanguages.length === 0 || topics.length === 0}
          label="Enregistrer les préférences"
          loading={isSaving}
          onPress={() => void saveEditedPreferences()}
        />
        <TextButton disabled={isSaving} label="Annuler" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  container: { backgroundColor: colors.background, gap: spacing.xxl, padding: spacing.xl },
  description: { ...typography.bodySecondary },
  error: { ...typography.bodySecondary, color: colors.error, textAlign: 'center' },
  heading: { gap: spacing.sm },
  keyboardView: { flex: 1 },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.sectionTitle },
  statusText: { ...typography.bodySecondary },
  title: { ...typography.screenTitle },
});

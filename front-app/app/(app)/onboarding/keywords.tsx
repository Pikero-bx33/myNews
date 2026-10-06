import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { KeywordEditor } from '@/components/preferences/keyword-editor';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';
import { savePreferences } from '@/lib/api/preferences';
import { colors, typography } from '@/theme/tokens';

import { useOnboarding } from './_layout';

export default function KeywordsScreen() {
  const { contentLanguages, keywords, setKeywords, topics } = useOnboarding();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const finishOnboarding = async () => {
    setErrorMessage(null);
    setIsSaving(true);

    try {
      await savePreferences({
        blockedSources: [],
        contentLanguages,
        keywords,
        preferredSources: [],
        topics,
      });
      router.replace('/home');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible d’enregistrer vos préférences. Réessayez.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingScreen
      description="Ajoutez des sujets précis comme Tesla, SpaceX ou IA. Cette étape est facultative."
      step={3}
      title="Vos mots-clés">
      <KeywordEditor keywords={keywords} onChangeKeywords={setKeywords} />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <View style={styles.actions}>
        <TextButton disabled={isSaving} label="Retour" onPress={() => router.replace('/onboarding/topics')} />
        <PrimaryButton label="Terminer" loading={isSaving} onPress={() => void finishOnboarding()} />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  error: { ...typography.bodySecondary, color: colors.error },
});

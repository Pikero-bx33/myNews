import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { SelectableChip } from '@/components/onboarding/selectable-chip';
import { contentLanguageOptions } from '@/components/preferences/options';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { ContentLanguage } from '@/lib/api/preferences';
import { spacing } from '@/theme/tokens';

import { useOnboarding } from './_layout';

export default function LanguagesScreen() {
  const { contentLanguages, setContentLanguages } = useOnboarding();

  const toggleLanguage = (language: ContentLanguage) => {
    setContentLanguages((currentLanguages) =>
      currentLanguages.includes(language)
        ? currentLanguages.filter((item) => item !== language)
        : [...currentLanguages, language],
    );
  };

  return (
    <OnboardingScreen
      description="Choisissez les langues des actualités que vous souhaitez recevoir."
      step={1}
      title="Vos langues de contenu">
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
      <PrimaryButton
        disabled={contentLanguages.length === 0}
        onPress={() => router.push('/onboarding/topics')}
        label="Continuer"
      />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});

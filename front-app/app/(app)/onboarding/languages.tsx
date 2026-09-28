import { Button, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { SelectableChip } from '@/components/onboarding/selectable-chip';
import type { ContentLanguage } from '@/lib/api/preferences';

import { useOnboarding } from './_layout';

const languages: { label: string; value: ContentLanguage }[] = [
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' },
];

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
        {languages.map((language) => (
          <SelectableChip
            key={language.value}
            label={language.label}
            onPress={() => toggleLanguage(language.value)}
            selected={contentLanguages.includes(language.value)}
          />
        ))}
      </View>
      <Button
        disabled={contentLanguages.length === 0}
        onPress={() => router.push('/onboarding/topics')}
        title="Continuer"
      />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

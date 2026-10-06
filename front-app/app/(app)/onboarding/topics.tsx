import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { SelectableChip } from '@/components/onboarding/selectable-chip';
import { topicOptions } from '@/components/preferences/options';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';
import { spacing } from '@/theme/tokens';

import { useOnboarding } from './_layout';

export default function TopicsScreen() {
  const { setTopics, topics: selectedTopics } = useOnboarding();

  const toggleTopic = (topic: string) => {
    setTopics(
      selectedTopics.includes(topic)
        ? selectedTopics.filter((item) => item !== topic)
        : [...selectedTopics, topic],
    );
  };

  return (
    <OnboardingScreen
      description="Sélectionnez au moins un thème pour personnaliser votre futur fil d’actualité."
      step={2}
      title="Vos centres d’intérêt">
      <View style={styles.choices}>
        {topicOptions.map((topic) => (
          <SelectableChip
            key={topic.slug}
            label={topic.label}
            onPress={() => toggleTopic(topic.slug)}
            selected={selectedTopics.includes(topic.slug)}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <TextButton label="Retour" onPress={() => router.replace('/onboarding/languages')} />
        <PrimaryButton
          disabled={selectedTopics.length === 0}
          onPress={() => router.push('/onboarding/keywords')}
          label="Continuer"
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});

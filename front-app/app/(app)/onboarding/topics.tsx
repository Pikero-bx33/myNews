import { Button, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { SelectableChip } from '@/components/onboarding/selectable-chip';

import { useOnboarding } from './_layout';

const topics = [
  { label: 'Sport', slug: 'sport' },
  { label: 'Technology', slug: 'technology' },
  { label: 'Science', slug: 'science' },
  { label: 'Politics', slug: 'politics' },
  { label: 'Business', slug: 'business' },
  { label: 'Cinema', slug: 'cinema' },
  { label: 'Culture', slug: 'culture' },
  { label: 'Food', slug: 'food' },
  { label: 'Health', slug: 'health' },
];

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
        {topics.map((topic) => (
          <SelectableChip
            key={topic.slug}
            label={topic.label}
            onPress={() => toggleTopic(topic.slug)}
            selected={selectedTopics.includes(topic.slug)}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <Button onPress={() => router.replace('/onboarding/languages')} title="Retour" />
        <Button
          disabled={selectedTopics.length === 0}
          onPress={() => router.push('/onboarding/keywords')}
          title="Continuer"
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

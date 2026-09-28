import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type OnboardingScreenProps = {
  children: ReactNode;
  description: string;
  step: number;
  title: string;
};

export function OnboardingScreen({ children, description, step, title }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingBottom: insets.bottom + 40,
          paddingTop: insets.top + 24,
        },
      ]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.progressContainer}>
        <Text style={styles.progress}>Étape {step} / 3</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressValue, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </View>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
    gap: 28,
    padding: 24,
    paddingBottom: 40,
  },
  description: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
  },
  heading: {
    gap: 8,
  },
  progress: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    gap: 8,
  },
  progressTrack: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
  },
  progressValue: {
    backgroundColor: '#2563EB',
    borderRadius: 4,
    height: '100%',
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '700',
  },
});

import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme/tokens';
import { WebContentContainer } from '@/components/ui/web-content-container';

type OnboardingScreenProps = {
  children: ReactNode;
  description: string;
  step: number;
  title: string;
};

export function OnboardingScreen({ children, description, step, title }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: insets.bottom + spacing.xxl,
            paddingTop: insets.top + spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <WebContentContainer maxWidth={480} style={styles.content}>
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
        </WebContentContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  content: { gap: spacing.xxl },
  description: { ...typography.bodySecondary },
  heading: {
    gap: spacing.sm,
  },
  keyboardView: { flex: 1 },
  progress: { ...typography.caption },
  progressContainer: {
    gap: spacing.sm,
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 6,
    overflow: 'hidden',
  },
  progressValue: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  title: { ...typography.display },
});

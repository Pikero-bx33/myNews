import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

type EmptyStateProps = {
  iconName?: 'bookmark-outline' | 'newspaper-outline';
  message: string;
  title: string;
};

export function EmptyState({ iconName, message, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {iconName ? <Ionicons accessible={false} color={colors.iconDefault} name={iconName} size={28} /> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
  },
  message: {
    ...typography.bodySecondary,
    textAlign: 'center',
  },
  title: {
    ...typography.sectionTitle,
    textAlign: 'center',
  },
});

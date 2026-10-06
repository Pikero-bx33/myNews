import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

type TextButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'danger';
};

export function TextButton({ disabled = false, label, onPress, tone = 'primary' }: TextButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      <Text style={[styles.label, tone === 'danger' && styles.dangerLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  dangerLabel: { color: colors.error },
  disabled: { opacity: 0.5 },
  label: { ...typography.button, color: colors.primary },
  pressed: { opacity: 0.7 },
});

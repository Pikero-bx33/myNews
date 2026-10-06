import { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

type FormFieldProps = Omit<TextInputProps, 'onBlur' | 'onFocus' | 'style'> & {
  label: string;
};

export function FormField({ label, ...inputProps }: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, isFocused && styles.inputFocused]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2, paddingHorizontal: spacing.md - 1 },
  label: { ...typography.caption, color: colors.textPrimary },
});

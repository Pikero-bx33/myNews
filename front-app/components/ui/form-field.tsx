import { useState, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

type FormFieldProps = Omit<TextInputProps, 'onBlur' | 'onFocus' | 'style'> & {
  label: string;
  rightAccessory?: ReactNode;
};

export function FormField({ label, rightAccessory, ...inputProps }: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <TextInput
          accessibilityLabel={label}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          {...inputProps}
        />
        {rightAccessory ? <View style={styles.rightAccessory}>{rightAccessory}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  input: {
    ...typography.body,
    flex: 1,
    minHeight: 48,
    ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2 },
  label: { ...typography.caption, color: colors.textPrimary },
  rightAccessory: { marginRight: spacing.xs },
});

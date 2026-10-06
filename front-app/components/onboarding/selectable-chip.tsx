import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

type SelectableChipProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
};

export function SelectableChip({ label, onPress, selected }: SelectableChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}>
      <View style={styles.content}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
        {selected ? <Ionicons accessible={false} color={colors.primary} name="checkmark" size={16} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  label: { ...typography.body, color: colors.textPrimary },
  pressed: { opacity: 0.72 },
  selectedChip: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  selectedLabel: {
    color: colors.primary,
  },
});

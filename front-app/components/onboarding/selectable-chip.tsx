import { Pressable, StyleSheet, Text } from 'react-native';

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
      style={[styles.chip, selected && styles.selectedChip]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedChip: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  selectedLabel: {
    color: '#1D4ED8',
  },
});

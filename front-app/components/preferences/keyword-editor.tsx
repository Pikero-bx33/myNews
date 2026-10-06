import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormField } from '@/components/ui/form-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { colors, radius, spacing, typography } from '@/theme/tokens';

type KeywordEditorProps = {
  keywords: string[];
  onChangeKeywords: (keywords: string[]) => void;
};

export function KeywordEditor({ keywords, onChangeKeywords }: KeywordEditorProps) {
  const [keyword, setKeyword] = useState('');

  const addKeyword = () => {
    const normalizedKeyword = keyword.trim();

    if (
      !normalizedKeyword ||
      keywords.some((item) => item.toLocaleLowerCase() === normalizedKeyword.toLocaleLowerCase())
    ) {
      return;
    }

    onChangeKeywords([...keywords, normalizedKeyword]);
    setKeyword('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.input}>
          <FormField
            autoCapitalize="sentences"
            label="Ajouter un mot-clé"
            onChangeText={setKeyword}
            onSubmitEditing={addKeyword}
            placeholder="Ex. SpaceX"
            returnKeyType="done"
            value={keyword}
          />
        </View>
        <PrimaryButton disabled={!keyword.trim()} label="Ajouter" onPress={addKeyword} />
      </View>
      {keywords.length > 0 ? (
        <View style={styles.keywords}>
          {keywords.map((item) => (
            <Pressable
              accessibilityLabel={`Supprimer ${item}`}
              accessibilityRole="button"
              key={item}
              onPress={() => onChangeKeywords(keywords.filter((keywordItem) => keywordItem !== item))}
              style={({ pressed }) => [styles.keyword, pressed && styles.keywordPressed]}>
              <Text style={styles.keywordLabel}>{item} ×</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  input: { flex: 1 },
  inputRow: { alignItems: 'flex-end', flexDirection: 'row', gap: spacing.sm },
  keyword: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  keywordLabel: { ...typography.caption, color: colors.primary },
  keywordPressed: { opacity: 0.7 },
  keywords: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});

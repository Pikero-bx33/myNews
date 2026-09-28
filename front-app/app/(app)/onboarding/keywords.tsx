import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { savePreferences } from '@/lib/api/preferences';

import { useOnboarding } from './_layout';

export default function KeywordsScreen() {
  const { contentLanguages, keywords, setKeywords, topics } = useOnboarding();
  const [keyword, setKeyword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addKeyword = () => {
    const normalizedKeyword = keyword.trim();

    if (
      !normalizedKeyword ||
      keywords.some((item) => item.toLocaleLowerCase() === normalizedKeyword.toLocaleLowerCase())
    ) {
      return;
    }

    setKeywords([...keywords, normalizedKeyword]);
    setKeyword('');
  };

  const finishOnboarding = async () => {
    setErrorMessage(null);
    setIsSaving(true);

    try {
      await savePreferences({
        blockedSources: [],
        contentLanguages,
        keywords,
        preferredSources: [],
        topics,
      });
      router.replace('/home');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible d’enregistrer vos préférences. Réessayez.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingScreen
      description="Ajoutez des sujets précis comme Tesla, SpaceX ou IA. Cette étape est facultative."
      step={3}
      title="Vos mots-clés">
      <View style={styles.inputRow}>
        <TextInput
          autoCapitalize="sentences"
          onChangeText={setKeyword}
          onSubmitEditing={addKeyword}
          placeholder="Ex. SpaceX"
          returnKeyType="done"
          style={styles.input}
          value={keyword}
        />
        <Button disabled={!keyword.trim()} onPress={addKeyword} title="Ajouter" />
      </View>
      <View style={styles.keywords}>
        {keywords.map((item) => (
          <Pressable key={item} onPress={() => setKeywords(keywords.filter((keyword) => keyword !== item))} style={styles.keyword}>
            <Text style={styles.keywordLabel}>{item} ×</Text>
          </Pressable>
        ))}
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <View style={styles.actions}>
        <Button disabled={isSaving} onPress={() => router.replace('/onboarding/topics')} title="Retour" />
        <Button
          disabled={isSaving}
          onPress={finishOnboarding}
          title={isSaving ? 'Enregistrement...' : 'Terminer'}
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
  error: {
    color: '#EF4444',
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  keyword: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  keywordLabel: {
    color: '#1D4ED8',
    fontWeight: '500',
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

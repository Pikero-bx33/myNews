import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextButton } from '@/components/ui/text-button';
import { authClient } from '@/lib/auth-client';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setErrorMessage(null);
    setIsSigningOut(true);

    const { error } = await authClient.signOut();

    if (error) {
      setErrorMessage(error.message ?? 'Impossible de vous déconnecter.');
    }

    setIsSigningOut(false);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.xl, paddingTop: insets.top + spacing.xl }]}>
      <Text style={styles.title}>Profil</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Compte</Text>
        <Text style={styles.email}>{session?.user.email ?? 'Email indisponible'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Préférences</Text>
        <Pressable
          accessibilityHint="Ouvre la modification de vos préférences"
          accessibilityRole="button"
          onPress={() => router.push('/preferences/edit')}
          style={({ pressed }) => [styles.preferenceRow, pressed && styles.preferenceRowPressed]}>
          <View style={styles.preferenceCopy}>
            <Text style={styles.preferenceTitle}>Modifier mes préférences</Text>
            <Text style={styles.preferenceDescription}>Langues, thèmes et mots-clés</Text>
          </View>
          <Ionicons accessible={false} color={colors.iconDefault} name="chevron-forward" size={20} />
        </Pressable>
      </View>
      <View style={styles.actions}>
        <TextButton
          disabled={isSigningOut}
          label={isSigningOut ? 'Déconnexion…' : 'Se déconnecter'}
          onPress={() => void signOut()}
          tone="danger"
        />
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'flex-start' },
  container: { backgroundColor: colors.background, flex: 1, gap: spacing.xl, paddingHorizontal: spacing.xl },
  email: { ...typography.body },
  error: { ...typography.bodySecondary, color: colors.error },
  label: { ...typography.caption },
  preferenceCopy: { flex: 1, gap: spacing.xs },
  preferenceDescription: { ...typography.bodySecondary },
  preferenceRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, minHeight: 56 },
  preferenceRowPressed: { opacity: 0.7 },
  preferenceTitle: { ...typography.body, fontFamily: 'Inter_600SemiBold' },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  title: { ...typography.screenTitle },
});

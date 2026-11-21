import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/branding/brand-logo';
import { WebContentContainer } from '@/components/ui/web-content-container';
import { authClient } from '@/lib/auth-client';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const userName = session?.user.name?.trim();

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
      <WebContentContainer maxWidth={560} style={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Accueil"
            accessibilityRole="button"
            onPress={() => router.replace('/home')}
            style={({ pressed }) => [styles.logoButton, pressed && styles.logoButtonPressed]}>
            <BrandLogo width={144} />
          </Pressable>
          <Text style={styles.title}>{userName ? `Profil de ${userName}` : 'Profil'}</Text>
        </View>
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
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isSigningOut, disabled: isSigningOut }}
            disabled={isSigningOut}
            onPress={() => void signOut()}
            style={({ pressed }) => [styles.signOutButton, isSigningOut && styles.signOutButtonDisabled, pressed && !isSigningOut && styles.signOutButtonPressed]}>
            <Text style={styles.signOutButtonText}>{isSigningOut ? 'Déconnexion…' : 'Se déconnecter'}</Text>
          </Pressable>
        </View>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </WebContentContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { width: '100%' },
  container: { backgroundColor: colors.background, flex: 1, paddingHorizontal: spacing.xl },
  content: { gap: spacing.xl },
  email: { ...typography.body },
  error: { ...typography.bodySecondary, color: colors.error },
  header: { gap: spacing.sm },
  label: { ...typography.caption },
  logoButton: { alignSelf: 'center', marginBottom: spacing.xl },
  logoButtonPressed: { opacity: 0.7 },
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
  signOutButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    marginTop: 20
  },
  signOutButtonDisabled: { opacity: 0.6 },
  signOutButtonPressed: { opacity: 0.8 },
  signOutButtonText: { ...typography.button, color: colors.surface },
  title: { ...typography.screenTitle },
});

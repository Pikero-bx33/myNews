import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authClient } from '@/lib/auth-client';

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
    <View style={[styles.container, { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Profil</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Compte</Text>
        <Text style={styles.email}>{session?.user.email ?? 'Email indisponible'}</Text>
      </View>
      <View style={styles.actions}>
        <Button disabled={isSigningOut} onPress={() => void signOut()} title="Se déconnecter" />
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 12 },
  container: { backgroundColor: '#F9FAFB', flex: 1, gap: 24, padding: 24 },
  email: { color: '#111827', fontSize: 16 },
  error: { color: '#EF4444', lineHeight: 22 },
  label: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  section: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  title: { color: '#111827', fontSize: 30, fontWeight: '700' },
});

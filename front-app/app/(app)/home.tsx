import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { authClient } from '@/lib/auth-client';

export default function HomeScreen() {
  const { data: session } = authClient.useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setErrorMessage(null);
    setIsSigningOut(true);

    const { error } = await authClient.signOut();

    if (error) {
      setErrorMessage(error.message ?? 'Impossible de se déconnecter.');
    }

    setIsSigningOut(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Préférences prêtes</Text>
      <Text style={styles.description}>Vos préférences ont été enregistrées.</Text>
      <Text>Email : {session?.user.email ?? 'Indisponible'}</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button disabled={isSigningOut} onPress={handleSignOut} title="Sign out" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  description: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: '#EF4444',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '600',
  },
});

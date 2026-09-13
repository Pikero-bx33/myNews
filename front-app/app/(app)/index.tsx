import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { authClient } from '@/lib/auth-client';

export default function AuthenticatedScreen() {
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
      <Text style={styles.title}>Utilisateur connecté</Text>
      <Text>Email : {session?.user.email ?? 'Indisponible'}</Text>
      <Text>Session : {session?.session.id ?? 'Indisponible'}</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button disabled={isSigningOut} onPress={handleSignOut} title="Sign out" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: '#b00020',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
});

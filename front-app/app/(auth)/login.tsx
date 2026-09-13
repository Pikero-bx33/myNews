import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';

import { authClient } from '@/lib/auth-client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setErrorMessage(error.message ?? 'Impossible de se connecter.');
    }

    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setPassword}
        placeholder="Mot de passe"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button disabled={isSubmitting} onPress={handleSignIn} title="Sign in" />
      <Link href="/register" style={styles.link}>
        Créer un compte
      </Link>
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
  input: {
    borderColor: '#999',
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
  },
  link: {
    alignSelf: 'center',
    color: '#0a66c2',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
});

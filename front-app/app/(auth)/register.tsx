import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/ui/form-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';
import { authClient } from '@/lib/auth-client';
import { colors, spacing, typography } from '@/theme/tokens';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await authClient.signUp.email({ name, email, password });

    if (error) {
      setErrorMessage(error.message ?? 'Impossible de créer le compte.');
    }

    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + spacing.xl, paddingTop: insets.top + spacing.xl }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.branding}>
          <Text style={styles.appName}>myNews</Text>
          <Text style={styles.title}>Créer votre compte</Text>
          <Text style={styles.subtitle}>Personnalisez votre fil d’actualité en quelques instants.</Text>
        </View>
        <View style={styles.form}>
          <FormField autoCapitalize="words" label="Nom" onChangeText={setName} placeholder="Votre nom" value={name} />
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Adresse e-mail"
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            value={email}
          />
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            label="Mot de passe"
            onChangeText={setPassword}
            placeholder="Choisissez un mot de passe"
            secureTextEntry
            value={password}
          />
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <PrimaryButton label="Créer un compte" loading={isSubmitting} onPress={() => void handleSignUp()} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
          <TextButton label="Se connecter" onPress={() => router.push('/login')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  appName: { ...typography.button, color: colors.primary },
  branding: { gap: spacing.sm },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  error: { ...typography.bodySecondary, color: colors.error },
  footer: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxl },
  footerText: { ...typography.bodySecondary, textAlign: 'center' },
  form: { gap: spacing.lg, marginTop: spacing.xxl },
  keyboardView: { flex: 1 },
  subtitle: { ...typography.bodySecondary },
  title: { ...typography.display },
});

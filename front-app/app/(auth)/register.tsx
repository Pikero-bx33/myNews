import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/branding/brand-logo';
import { FormField } from '@/components/ui/form-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';
import { WebContentContainer } from '@/components/ui/web-content-container';
import { authClient } from '@/lib/auth-client';
import { colors, spacing, typography } from '@/theme/tokens';

const validatePassword = (password: string) => {
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une majuscule.';
  }

  if (!/\d/.test(password)) {
    return 'Le mot de passe doit contenir au moins un chiffre.';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un caractère spécial.';
  }

  return null;
};

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    setErrorMessage(null);

    const passwordError = validatePassword(password);

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

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
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + spacing.xxl, paddingTop: insets.top + spacing.xl }]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled">
        <WebContentContainer maxWidth={480}>
          <View style={styles.branding}>
          <View style={styles.logoContainer}>
            <BrandLogo width={144} />
          </View>
          <Text style={styles.title}>Créer votre compte</Text>
          <Text style={styles.subtitle}>Personnalisez votre fil d’actualité en quelques instants.</Text>
          </View>
          <View style={styles.form}>
          <View style={styles.fields}>
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
              rightAccessory={
                <Pressable
                  accessibilityLabel={isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  accessibilityRole="button"
                  hitSlop={spacing.sm}
                  onPress={() => setIsPasswordVisible((isVisible) => !isVisible)}>
                  <Ionicons
                    accessible={false}
                    color={colors.iconDefault}
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                  />
                </Pressable>
              }
              secureTextEntry={!isPasswordVisible}
              value={password}
            />
            <Text style={styles.passwordHelper}>
              8 caractères minimum, avec une majuscule, un chiffre et un caractère spécial.
            </Text>
            <FormField
              autoCapitalize="none"
              autoCorrect={false}
              label="Confirmer le mot de passe"
              onChangeText={setPasswordConfirmation}
              placeholder="Confirmez votre mot de passe"
              rightAccessory={
                <Pressable
                  accessibilityLabel={
                    isPasswordConfirmationVisible ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'
                  }
                  accessibilityRole="button"
                  hitSlop={spacing.sm}
                  onPress={() => setIsPasswordConfirmationVisible((isVisible) => !isVisible)}>
                  <Ionicons
                    accessible={false}
                    color={colors.iconDefault}
                    name={isPasswordConfirmationVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                  />
                </Pressable>
              }
              secureTextEntry={!isPasswordConfirmationVisible}
              value={passwordConfirmation}
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
          <View style={styles.primaryAction}>
            <PrimaryButton label="Créer un compte" loading={isSubmitting} onPress={() => void handleSignUp()} />
          </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
            <TextButton label="Se connecter" onPress={() => router.push('/login')} />
          </View>
        </WebContentContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  branding: { gap: spacing.md },
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
  },
  error: { ...typography.bodySecondary, color: colors.error },
  fields: { gap: spacing.lg, marginBottom: 50 },
  footer: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxl },
  footerText: { ...typography.bodySecondary, textAlign: 'center' },
  form: { marginTop: spacing.xxl },
  keyboardView: { flex: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  passwordHelper: { ...typography.caption, marginTop: -spacing.sm },
  primaryAction: { marginTop: spacing.xxl },
  subtitle: { ...typography.bodySecondary, marginBottom: 30 },
  title: { ...typography.display, fontSize: 26, lineHeight: 32 },
});

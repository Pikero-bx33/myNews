import { Stack } from 'expo-router';

import { colors, typography } from '@/theme/tokens';

export default function AppLayout() {
  return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="preferences/edit"
          options={{
            headerBackTitle: 'Profil',
            headerShown: true,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.primary,
            headerTitle: 'Préférences',
            headerTitleStyle: { ...typography.sectionTitle },
          }}
        />
    </Stack>
  );
}

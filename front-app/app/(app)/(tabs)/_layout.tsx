import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { colors, spacing } from '@/theme/tokens';

const tabIcons = {
  home: { active: 'home', inactive: 'home-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
  saved: { active: 'bookmark', inactive: 'bookmark-outline' },
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.iconDefault,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          marginTop: spacing.xs,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: spacing.xs,
        },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            color={color}
            name={tabIcons[route.name as keyof typeof tabIcons][focused ? 'active' : 'inactive']}
            size={size}
          />
        ),
      })}>
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="saved" options={{ title: 'Enregistrés' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

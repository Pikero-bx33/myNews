import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { colors, spacing } from '@/theme/tokens';

const tabIcons = {
  home: { active: 'home', inactive: 'home-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
  saved: { active: 'bookmark', inactive: 'bookmark-outline' },
} as const;

const isWeb = Platform.OS === 'web';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        ...(isWeb
          ? {
              tabBarLabelPosition: 'below-icon' as const,
              tabBarShowLabel: true,
            }
          : {}),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.iconDefault,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          marginTop: spacing.xs,
        },
        tabBarStyle: {
          ...(isWeb
            ? {
                alignSelf: 'center',
                maxWidth: 620,
                width: '100%',
              }
            : {}),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: spacing.xs,
        },
        tabBarIcon: ({ color, focused, size }) => {
          const iconColor = color === null || typeof color === 'number' ? colors.iconDefault : color;

          return (
            <Ionicons
              color={iconColor}
              name={tabIcons[route.name as keyof typeof tabIcons][focused ? 'active' : 'inactive']}
              size={size}
            />
          );
        },
      })}>
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="saved" options={{ title: 'Enregistrés' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

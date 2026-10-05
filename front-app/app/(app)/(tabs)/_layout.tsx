import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

const tabIcons = {
  home: 'home-outline',
  profile: 'person-outline',
  saved: 'bookmark-outline',
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E7EB' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={tabIcons[route.name as keyof typeof tabIcons]} size={size} />
        ),
      })}>
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="saved" options={{ title: 'Enregistrés' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

import type { TextStyle } from 'react-native';

/**
 * Shared visual foundation for the light myNews interface.
 * Screens will adopt these tokens progressively during the visual redesign.
 */
export const colors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primarySoft: '#DBEAFE',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  iconDefault: '#6B7280',
  iconActive: '#2563EB',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  display: {
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 34,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySecondary: {
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    color: colors.textSecondary,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
} satisfies Record<string, TextStyle>;

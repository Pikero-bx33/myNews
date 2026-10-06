import type { ContentLanguage } from '@/lib/api/preferences';

export const contentLanguageOptions: { label: string; value: ContentLanguage }[] = [
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' },
];

export const topicOptions = [
  { label: 'Sport', slug: 'sport' },
  { label: 'Technology', slug: 'technology' },
  { label: 'Science', slug: 'science' },
  { label: 'Politics', slug: 'politics' },
  { label: 'Business', slug: 'business' },
  { label: 'Cinema', slug: 'cinema' },
  { label: 'Culture', slug: 'culture' },
  { label: 'Food', slug: 'food' },
  { label: 'Health', slug: 'health' },
] as const;

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from 'react';
import { Stack } from 'expo-router';

import type { ContentLanguage } from '@/lib/api/preferences';

type OnboardingState = {
  contentLanguages: ContentLanguage[];
  keywords: string[];
  topics: string[];
};

type OnboardingContextValue = OnboardingState & {
  setContentLanguages: Dispatch<SetStateAction<ContentLanguage[]>>;
  setKeywords: (keywords: string[]) => void;
  setTopics: (topics: string[]) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function OnboardingProvider({ children }: { children: ReactNode }) {
  const [contentLanguages, setContentLanguages] = useState<ContentLanguage[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  return (
    <OnboardingContext.Provider
      value={{
        contentLanguages,
        keywords,
        setContentLanguages,
        setKeywords,
        setTopics,
        topics,
      }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding must be used inside the onboarding flow.');
  }

  return context;
}

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}

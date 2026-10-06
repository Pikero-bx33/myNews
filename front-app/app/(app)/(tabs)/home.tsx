import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/feed/article-card';
import { EmptyState } from '@/components/ui/empty-state';
import { updateArticleState, type ArticleUserState } from '@/lib/api/articles';
import { FeedRequestError, getFeed, type FeedArticle } from '@/lib/api/feed';
import { hydrateArticleStates, setArticleState, toArticleStatesById } from '@/store/article-states-slice';
import type { AppDispatch, RootState } from '@/store/store';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const articleStatesById = useSelector((state: RootState) => state.articleStates.byId);
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleFeedError = useCallback((error: unknown) => {
    if (error instanceof FeedRequestError && error.status === 409) {
      router.replace('/onboarding/languages');
      return;
    }

    setErrorMessage(
      error instanceof Error ? error.message : 'Impossible de charger vos actualités. Réessayez.',
    );
  }, []);

  const reloadFeed = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoading(true);
      }
      setErrorMessage(null);

      try {
        const nextArticles = await getFeed();
        setArticles(nextArticles);
        dispatch(hydrateArticleStates(toArticleStatesById(nextArticles)));
      } catch (error) {
        handleFeedError(error);
      } finally {
        if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [dispatch, handleFeedError],
  );

  const updateLocalArticleState = useCallback(
    async (article: FeedArticle, update: { isFavorite?: boolean; isRead?: boolean }) => {
      setActionError(null);

      try {
        const userState = await updateArticleState(article.id, update);
        dispatch(setArticleState({ articleId: article.id, userState }));
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : 'Impossible de mettre à jour cet article.',
        );
      }
    },
    [dispatch],
  );

  useEffect(() => {
    let isMounted = true;

    void getFeed()
      .then((nextArticles) => {
        if (isMounted) {
          setArticles(nextArticles);
          dispatch(hydrateArticleStates(toArticleStatesById(nextArticles)));
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          handleFeedError(error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch, handleFeedError]);

  if (isInitialLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Chargement de vos actualités…</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.error}>{errorMessage}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void reloadFeed()}
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      alwaysBounceVertical
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 },
      ]}
      data={articles}
      keyExtractor={(article) => article.id}
      ListEmptyComponent={
        <EmptyState
          iconName="newspaper-outline"
          message="Aucun article ne correspond à vos préférences actuelles."
          title="Aucun article trouvé"
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.appName}>myNews</Text>
          <Text style={styles.title}>Vos actualités</Text>
          <Text style={styles.subtitle}>Votre sélection, selon vos centres d’intérêt.</Text>
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
        </View>
      }
      refreshControl={
        <RefreshControl
          onRefresh={() => void reloadFeed(true)}
          refreshing={isRefreshing}
          tintColor={colors.primary}
        />
      }
      renderItem={({ item }) => {
        const userState: ArticleUserState = articleStatesById[item.id] ?? item.userState;
        const article = { ...item, userState };

        return (
          <ArticleCard
            article={article}
            onToggleFavorite={(currentArticle) =>
              updateLocalArticleState(currentArticle, {
                isFavorite: !currentArticle.userState.isFavorite,
              })
            }
            onToggleRead={(currentArticle) =>
              updateLocalArticleState(currentArticle, { isRead: !currentArticle.userState.isRead })
            }
          />
        );
      }}
      showsVerticalScrollIndicator={false}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  appName: { ...typography.button, color: colors.primary },
  centeredContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  error: { ...typography.bodySecondary, color: colors.error, textAlign: 'center' },
  header: { gap: spacing.sm, marginBottom: spacing.xl },
  list: { flex: 1 },
  listContent: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  loadingText: { ...typography.bodySecondary, textAlign: 'center' },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  retryButtonPressed: { backgroundColor: colors.primaryLight },
  retryButtonText: { ...typography.button, color: colors.surface },
  subtitle: { ...typography.bodySecondary },
  title: { ...typography.display },
});

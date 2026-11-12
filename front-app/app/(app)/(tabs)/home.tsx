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

import { BrandLogo } from '@/components/branding/brand-logo';
import { ArticleCard } from '@/components/feed/article-card';
import { EmptyState } from '@/components/ui/empty-state';
import { updateArticleState, type ArticleUserState } from '@/lib/api/articles';
import { FeedRequestError, getFeed, type FeedArticle } from '@/lib/api/feed';
import { hydrateArticleStates, setArticleState, toArticleStatesById } from '@/store/article-states-slice';
import type { AppDispatch, RootState } from '@/store/store';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const appendUniqueArticles = (currentArticles: FeedArticle[], nextArticles: FeedArticle[]) => {
  const articlesById = new Map<string, FeedArticle>();

  for (const article of [...currentArticles, ...nextArticles]) {
    if (!articlesById.has(article.id)) {
      articlesById.set(article.id, article);
    }
  }

  return [...articlesById.values()];
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const articleStatesById = useSelector((state: RootState) => state.articleStates.byId);
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleFeedError = useCallback((error: unknown) => {
    if (error instanceof FeedRequestError && error.status === 409) {
      router.replace('/onboarding/languages');
      return;
    }

    setErrorMessage(
      error instanceof Error ? error.message : 'Impossible de charger vos actualités. Réessayez.',
    );
  }, []);

  const loadFirstPage = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoading(true);
      }
      setErrorMessage(null);
      setLoadMoreError(null);

      try {
        const feed = await getFeed(1);
        setArticles(feed.articles);
        setPage(feed.pagination.page);
        setHasMore(feed.pagination.hasMore);
        dispatch(hydrateArticleStates(toArticleStatesById(feed.articles)));
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

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    const nextPage = page + 1;

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const feed = await getFeed(nextPage);
      setArticles((currentArticles) => appendUniqueArticles(currentArticles, feed.articles));
      setPage(feed.pagination.page);
      setHasMore(feed.pagination.hasMore);
      dispatch(hydrateArticleStates(toArticleStatesById(feed.articles)));
    } catch (error) {
      if (error instanceof FeedRequestError && error.status === 409) {
        router.replace('/onboarding/languages');
        return;
      }

      setLoadMoreError(
        error instanceof Error ? error.message : 'Impossible de charger plus d’actualités. Réessayez.',
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, hasMore, isLoadingMore, page]);

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

    void getFeed(1)
      .then((feed) => {
        if (isMounted) {
          setArticles(feed.articles);
          setPage(feed.pagination.page);
          setHasMore(feed.pagination.hasMore);
          dispatch(hydrateArticleStates(toArticleStatesById(feed.articles)));
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
          onPress={() => void loadFirstPage()}
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
          <View style={styles.logoContainer}>
            <BrandLogo width={144} />
          </View>
          <Text style={styles.title}>Vos actualités</Text>
          <Text style={styles.subtitle}>Votre sélection, selon vos centres d’intérêt.</Text>
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
        </View>
      }
      ListFooterComponent={
        hasMore ? (
          <View style={styles.loadMoreContainer}>
            {loadMoreError ? <Text style={styles.loadMoreError}>{loadMoreError}</Text> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: isLoadingMore, disabled: isLoadingMore }}
              disabled={isLoadingMore}
              onPress={() => void loadMore()}
              style={({ pressed }) => [
                styles.loadMoreButton,
                isLoadingMore && styles.loadMoreButtonDisabled,
                pressed && !isLoadingMore && styles.loadMoreButtonPressed,
              ]}>
              {isLoadingMore ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.loadMoreButtonText}>
                  {loadMoreError ? 'Réessayer' : 'Voir plus d’articles'}
                </Text>
              )}
            </Pressable>
          </View>
        ) : undefined
      }
      refreshControl={
        <RefreshControl
          onRefresh={() => void loadFirstPage(true)}
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
  loadMoreButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  loadMoreButtonDisabled: { opacity: 0.6 },
  loadMoreButtonPressed: { backgroundColor: colors.primarySoft },
  loadMoreButtonText: { ...typography.button, color: colors.primary },
  loadMoreContainer: { gap: spacing.sm, paddingTop: spacing.sm },
  loadMoreError: { ...typography.bodySecondary, color: colors.error, textAlign: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: spacing.md },
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

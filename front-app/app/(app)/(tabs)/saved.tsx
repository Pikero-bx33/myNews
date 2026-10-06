import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/feed/article-card';
import { EmptyState } from '@/components/ui/empty-state';
import { updateArticleState, type ArticleUserState } from '@/lib/api/articles';
import { getFavorites } from '@/lib/api/favorites';
import type { FeedArticle } from '@/lib/api/feed';
import { hydrateArticleStates, setArticleState, toArticleStatesById } from '@/store/article-states-slice';
import type { AppDispatch, RootState } from '@/store/store';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const articleStatesById = useSelector((state: RootState) => state.articleStates.byId);
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const nextArticles = await getFavorites();
      setArticles(nextArticles);
      dispatch(hydrateArticleStates(toArticleStatesById(nextArticles)));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Impossible de charger vos articles enregistrés.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites]),
  );

  const updateSavedArticle = useCallback(
    async (article: FeedArticle, update: { isFavorite?: boolean; isRead?: boolean }) => {
      setActionError(null);

      try {
        const userState = await updateArticleState(article.id, update);
        dispatch(setArticleState({ articleId: article.id, userState }));

        if (!userState.isFavorite) {
          setArticles((currentArticles) =>
            currentArticles.filter((currentArticle) => currentArticle.id !== article.id),
          );
        }
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : 'Impossible de mettre à jour cet article.',
        );
      }
    },
    [dispatch],
  );

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Chargement de vos articles enregistrés…</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.error}>{errorMessage}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void loadFavorites()}
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 },
      ]}
      data={articles}
      keyExtractor={(article) => article.id}
      ListEmptyComponent={
        <EmptyState
          iconName="bookmark-outline"
          message="Enregistrez des articles depuis votre fil pour les retrouver ici."
          title="Aucun article enregistré"
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Enregistrés</Text>
          <Text style={styles.subtitle}>Vos articles favoris, disponibles à tout moment.</Text>
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
        </View>
      }
      renderItem={({ item }) => {
        const userState: ArticleUserState = articleStatesById[item.id] ?? item.userState;
        const article = { ...item, userState };

        return (
          <ArticleCard
            article={article}
            onToggleFavorite={(currentArticle) =>
              updateSavedArticle(currentArticle, {
                isFavorite: !currentArticle.userState.isFavorite,
              })
            }
            onToggleRead={(currentArticle) =>
              updateSavedArticle(currentArticle, { isRead: !currentArticle.userState.isRead })
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
  title: { ...typography.screenTitle },
});

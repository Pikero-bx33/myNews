import { useCallback, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/feed/article-card';
import { updateArticleState, type ArticleUserState } from '@/lib/api/articles';
import { getFavorites } from '@/lib/api/favorites';
import type { FeedArticle } from '@/lib/api/feed';
import { hydrateArticleStates, setArticleState, toArticleStatesById } from '@/store/article-states-slice';
import type { AppDispatch, RootState } from '@/store/store';

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
        <ActivityIndicator color="#2563EB" size="large" />
        <Text style={styles.loadingText}>Chargement de vos articles enregistrés…</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.error}>{errorMessage}</Text>
        <Button onPress={() => void loadFavorites()} title="Réessayer" />
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun article enregistré</Text>
          <Text style={styles.emptyText}>
            Enregistrez des articles depuis votre fil pour les retrouver ici.
          </Text>
        </View>
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
    backgroundColor: '#F9FAFB',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  emptyContainer: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 64 },
  emptyText: { color: '#6B7280', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  emptyTitle: { color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  error: { color: '#EF4444', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  header: { gap: 8, marginBottom: 24 },
  list: { flex: 1 },
  listContent: { backgroundColor: '#F9FAFB', flexGrow: 1, gap: 16, padding: 24 },
  loadingText: { color: '#6B7280', fontSize: 16 },
  subtitle: { color: '#6B7280', fontSize: 16, lineHeight: 24 },
  title: { color: '#111827', fontSize: 30, fontWeight: '700' },
});

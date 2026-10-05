import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/feed/article-card';
import { updateArticleState, type ArticleUserState } from '@/lib/api/articles';
import { FeedRequestError, getFeed, type FeedArticle } from '@/lib/api/feed';
import { hydrateArticleStates, setArticleState, toArticleStatesById } from '@/store/article-states-slice';
import type { AppDispatch, RootState } from '@/store/store';

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
        <ActivityIndicator color="#2563EB" size="large" />
        <Text style={styles.loadingText}>Chargement de vos actualités…</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.error}>{errorMessage}</Text>
        <Button onPress={() => void reloadFeed()} title="Réessayer" />
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun article trouvé</Text>
          <Text style={styles.emptyText}>Aucun article ne correspond à vos préférences actuelles.</Text>
        </View>
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.appName}>MyNews</Text>
          <Text style={styles.title}>Vos actualités</Text>
          <Text style={styles.subtitle}>Personnalisées selon vos centres d’intérêt</Text>
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
        </View>
      }
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void reloadFeed(true)} />}
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
  appName: { color: '#2563EB', fontSize: 16, fontWeight: '700' },
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

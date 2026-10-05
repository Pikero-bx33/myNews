import { Image } from 'expo-image';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureResponderEvent, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { FeedArticle } from '@/lib/api/feed';

type ArticleCardProps = {
  article: FeedArticle;
  onToggleFavorite: (article: FeedArticle) => Promise<void>;
  onToggleRead: (article: FeedArticle) => Promise<void>;
};

const formatPublishedAt = (publishedAt: string) => {
  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return 'Date indisponible';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export function ArticleCard({ article, onToggleFavorite, onToggleRead }: ArticleCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [pendingAction, setPendingAction] = useState<'favorite' | 'read' | null>(null);
  const imageSource = article.imageUrl && !hasImageError ? { uri: article.imageUrl } : null;

  const openArticle = () => {
    void Linking.openURL(article.articleUrl);
  };

  const toggleAction = async (
    event: GestureResponderEvent,
    action: 'favorite' | 'read',
    handler: (article: FeedArticle) => Promise<void>,
  ) => {
    event.stopPropagation();
    setPendingAction(action);

    try {
      await handler(article);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Pressable
      accessibilityHint="Ouvre l’article dans votre navigateur"
      accessibilityRole="link"
      onPress={openArticle}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {imageSource ? (
        <Image
          contentFit="cover"
          onError={() => setHasImageError(true)}
          source={imageSource}
          style={styles.image}
          transition={150}
        />
      ) : (
        <View accessibilityLabel="Image de l’article indisponible" style={styles.imageFallback}>
          <Text style={styles.imageFallbackText}>MyNews</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.source}>
            {article.sourceName}
          </Text>
          <Text style={styles.date}>{formatPublishedAt(article.publishedAt)}</Text>
        </View>
        <Text style={[styles.title, article.userState.isRead && styles.readTitle]}>{article.title}</Text>
        {article.description ? (
          <Text numberOfLines={3} style={styles.description}>
            {article.description}
          </Text>
        ) : null}
        {article.topics.length > 0 ? (
          <Text numberOfLines={1} style={styles.topics}>
            {article.topics.join(' · ')}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={article.userState.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            accessibilityRole="button"
            disabled={pendingAction !== null}
            onPress={(event) => void toggleAction(event, 'favorite', onToggleFavorite)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}>
            <Ionicons
              color={article.userState.isFavorite ? '#2563EB' : '#6B7280'}
              name={article.userState.isFavorite ? 'bookmark' : 'bookmark-outline'}
              size={22}
            />
            <Text style={styles.actionLabel}>
              {article.userState.isFavorite ? 'Enregistré' : 'Enregistrer'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={article.userState.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
            accessibilityRole="button"
            disabled={pendingAction !== null}
            onPress={(event) => void toggleAction(event, 'read', onToggleRead)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}>
            <Ionicons
              color={article.userState.isRead ? '#10B981' : '#6B7280'}
              name={article.userState.isRead ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={22}
            />
            <Text style={styles.actionLabel}>{article.userState.isRead ? 'Lu' : 'Non lu'}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingVertical: 4 },
  actionButtonPressed: { opacity: 0.65 },
  actionLabel: { color: '#374151', fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 20, marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.78 },
  content: { gap: 8, padding: 16 },
  date: { color: '#6B7280', fontSize: 13 },
  description: { color: '#6B7280', fontSize: 15, lineHeight: 22 },
  image: { backgroundColor: '#E5E7EB', height: 180, width: '100%' },
  imageFallback: {
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    height: 132,
    justifyContent: 'center',
  },
  imageFallbackText: { color: '#2563EB', fontSize: 16, fontWeight: '700' },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  readTitle: { color: '#6B7280' },
  source: { color: '#2563EB', flex: 1, fontSize: 13, fontWeight: '700' },
  title: { color: '#111827', fontSize: 19, fontWeight: '700', lineHeight: 25 },
  topics: { color: '#6B7280', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
});

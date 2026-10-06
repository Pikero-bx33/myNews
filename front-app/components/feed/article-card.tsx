import { Image } from 'expo-image';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureResponderEvent, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { FeedArticle } from '@/lib/api/feed';
import { colors, radius, spacing, typography } from '@/theme/tokens';

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
          <Ionicons accessible={false} color={colors.primary} name="newspaper-outline" size={30} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.source}>
            {article.sourceName}
          </Text>
          <Text style={styles.date}>· {formatPublishedAt(article.publishedAt)}</Text>
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
            accessibilityState={{ disabled: pendingAction !== null }}
            disabled={pendingAction !== null}
            onPress={(event) => void toggleAction(event, 'favorite', onToggleFavorite)}
            style={({ pressed }) => [
              styles.actionButton,
              pendingAction !== null && styles.actionButtonDisabled,
              pressed && styles.actionButtonPressed,
            ]}>
            <Ionicons
              color={article.userState.isFavorite ? colors.iconActive : colors.iconDefault}
              name={article.userState.isFavorite ? 'bookmark' : 'bookmark-outline'}
              size={22}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={article.userState.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
            accessibilityRole="button"
            accessibilityState={{ disabled: pendingAction !== null }}
            disabled={pendingAction !== null}
            onPress={(event) => void toggleAction(event, 'read', onToggleRead)}
            style={({ pressed }) => [
              styles.actionButton,
              pendingAction !== null && styles.actionButtonDisabled,
              pressed && styles.actionButtonPressed,
            ]}>
            <Ionicons
              color={article.userState.isRead ? colors.success : colors.iconDefault}
              name={article.userState.isRead ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={22}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  actionButtonDisabled: { opacity: 0.45 },
  actionButtonPressed: { backgroundColor: colors.primarySoft },
  actions: { flexDirection: 'row', gap: spacing.xs, marginLeft: -spacing.sm, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.86 },
  content: { gap: spacing.sm, padding: spacing.lg },
  date: { ...typography.caption, color: colors.textSecondary },
  description: { ...typography.bodySecondary },
  image: { aspectRatio: 16 / 9, backgroundColor: colors.border, width: '100%' },
  imageFallback: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  readTitle: { color: colors.textSecondary },
  source: { ...typography.caption, color: colors.primary, flex: 1 },
  title: { ...typography.cardTitle },
  topics: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
});

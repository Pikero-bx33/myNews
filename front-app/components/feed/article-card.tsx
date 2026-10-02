import { Image } from 'expo-image';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NormalizedArticle } from '@/lib/api/feed';

type ArticleCardProps = {
  article: NormalizedArticle;
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

export function ArticleCard({ article }: ArticleCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageSource = article.imageUrl && !hasImageError ? { uri: article.imageUrl } : null;

  const openArticle = () => {
    void Linking.openURL(article.articleUrl);
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
        <Text style={styles.title}>{article.title}</Text>
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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  source: { color: '#2563EB', flex: 1, fontSize: 13, fontWeight: '700' },
  title: { color: '#111827', fontSize: 19, fontWeight: '700', lineHeight: 25 },
  topics: { color: '#6B7280', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
});

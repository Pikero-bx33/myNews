# Data Model

## Principles

- Authentication data is managed by Better Auth.
- Application preferences are stored separately from authentication data.
- Topics are reusable application entities.
- Articles are shared across users.
- User-specific article states are stored separately.
- Avoid duplicating article documents per user.

---

## UserPreferences

Purpose:
Store the personalization settings for one user.

Conceptual fields:

- userId
- topics
- keywords
- contentLanguages
- preferredSources
- blockedSources
- createdAt
- updatedAt

A user can update these values at any time.

One user should have one preferences document.

---

## Topic

Purpose:
Represent a predefined high-level interest.

Fields:

- slug
- labels.fr
- labels.en
- icon
- isActive

Example:

{
  "slug": "technology",
  "labels": {
    "fr": "Technologie",
    "en": "Technology"
  },
  "icon": "laptop",
  "isActive": true
}

---

## Article

Purpose:
Store normalized article metadata when persistence or caching is required.

Fields:

- provider
- externalId
- canonicalUrl
- title
- description
- imageUrl
- sourceName
- sourceDomain
- publishedAt
- language
- topics
- fetchedAt

Do not store full article content unless licensing explicitly allows it.

---

## UserArticleState

Purpose:
Store a user's relationship with an article.

Fields:

- userId
- articleId
- isFavorite
- isRead
- isHidden
- savedAt
- readAt

A user/article pair should be unique.
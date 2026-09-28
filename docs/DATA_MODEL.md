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

Implemented fields:

| Field | Type | Notes |
| ---- | ---- | ---- |
| `userId` | `string` | Unique Better Auth `authUsers.id` UUID. It is not a MongoDB ObjectId. |
| `topics` | `string[]` | Empty by default. |
| `keywords` | `string[]` | Empty by default. |
| `contentLanguages` | `("fr" \| "en")[]` | Empty by default; only `fr` and `en` are accepted. |
| `preferredSources` | `string[]` | Empty by default; reserved for a future provider integration. |
| `blockedSources` | `string[]` | Empty by default; reserved for a future provider integration. |
| `createdAt` | `Date` | Managed by Mongoose timestamps. |
| `updatedAt` | `Date` | Managed by Mongoose timestamps. |

The collection name is `userPreferences`. A user can update these values at any time.

One user should have one preferences document.

The API never accepts a client-provided `userId`: it obtains the ID from the validated Better Auth session.

### Preferences API behaviour

`GET /api/v1/preferences` returns `{ "preferences": null }` when the authenticated user has no persisted document. When a document exists, it returns `{ "preferences": { ... } }`. This allows the mobile app to distinguish first login from an onboarding already completed without creating data during a GET.

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

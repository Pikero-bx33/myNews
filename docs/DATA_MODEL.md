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
Store the normalized metadata needed to display a provider article and associate it with user state. The collection name is `articles`.

| Field | Type | Notes |
| ---- | ---- | ---- |
| `provider` | `"thenewsapi"` | The provider that supplied the article. |
| `externalId` | `string` | The provider article UUID. |
| `title` | `string` | Article headline. |
| `description` | `string \| null` | Optional provider description. |
| `articleUrl` | `string` | Original publisher URL. |
| `imageUrl` | `string \| null` | Optional image URL. |
| `sourceName` | `string` | Current provider source value. |
| `sourceDomain` | `string` | Current provider source domain. |
| `publishedAt` | `Date` | Provider publication date. |
| `language` | `string` | Article language. |
| `topics` | `string[]` | Normalized myNews topic slugs. |
| `fetchedAt` | `Date` | Last time myNews retrieved this article. |
| `createdAt` / `updatedAt` | `Date` | Managed by Mongoose timestamps. |

The compound index `provider + externalId` is unique, so repeated feed requests update the same article rather than inserting duplicates. Full article content is never stored.

---

## UserArticleState

Purpose:
Store a user's independent favorite and reading status for one persisted article. The collection name is `userArticleStates`.

| Field | Type | Notes |
| ---- | ---- | ---- |
| `userId` | `string` | Better Auth `authUsers.id` UUID. |
| `articleId` | `ObjectId` | Reference to `articles._id`. |
| `isFavorite` | `boolean` | Defaults to `false`. |
| `isRead` | `boolean` | Defaults to `false`. |
| `savedAt` | `Date \| null` | Defaults to `null`; set only by a future explicit favorite action. |
| `readAt` | `Date \| null` | Defaults to `null`; set only by a future explicit read action. |
| `createdAt` / `updatedAt` | `Date` | Managed by Mongoose timestamps. |

The compound index `userId + articleId` is unique. `isFavorite` and `isRead` have no dependency: either can be true while the other is false. Opening an article does **not** automatically mark it as read.

`GET` requests never create a state document. `PUT /api/v1/articles/:articleId/state` creates it only when the user explicitly changes Favorite or Read. A document is retained even when both flags are `false`, so its lifecycle stays explicit and does not depend on automatic deletion.

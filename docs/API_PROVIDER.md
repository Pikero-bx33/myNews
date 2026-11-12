# News Provider

## MVP decision

TheNewsAPI is the single MVP provider. Its code is isolated in the backend so a later provider can be added without exposing a provider-specific format to the mobile app.

## Feed endpoint and provider request

`GET /api/v1/feed?page=n` is protected by Better Auth. An absent `page` means page 1; only positive integers are accepted. It obtains the user ID from the server-validated session, loads that user's `userPreferences` document, then makes exactly one request to:

```text
GET https://api.thenewsapi.com/v1/news/all
```

The provider request is created with `URL` and `URLSearchParams`. `api_token` is read only from `THE_NEWS_API_KEY`; the runtime configuration fails at startup when it is absent. The provider's free-plan limit is centralized as `FEED_LIMIT = 3`.

| Preference | Provider parameter | Transformation |
| --- | --- | --- |
| `contentLanguages` | `language` | `fr`, `en`, or `fr,en` |
| `topics` | `categories` | myNews topics map to provider categories and duplicates are removed |
| `keywords` | `search` | One simple OR query, e.g. `AI | surfing | Tesla` |
| `preferredSources` | `domains` | Comma-separated domains when non-empty |
| `blockedSources` | `exclude_domains` | Comma-separated domains when non-empty |
| requested page | `page` | Positive integer forwarded unchanged |
| feed freshness | `published_after` | UTC date for seven days before the request |
| feed order | `sort` | `published_at`, including when keywords add `search` |

Topic mapping: `sport → sports`, `technology → tech`, `science → science`, `politics → politics`, `business → business`, `cinema → entertainment`, `culture → entertainment`, `food → food`, `health → health`.

No request is made when an authenticated user has no persisted preferences: the backend returns `409 { "error": "Preferences required" }`. This explicitly distinguishes incomplete onboarding from an empty provider result.

## Validation and normalization

`api/src/schemas/thenewsapi.ts` validates the successful raw response with Zod before it is normalized. It validates only the response metadata and article fields used by myNews: `uuid`, `title`, `description`, `url`, `image_url`, `language`, `published_at`, `source`, and `categories`. The provider error payload `{ error: { code, message } }` has its own Zod schema.

The normalizer returns `NormalizedArticle[]`. Duplicate normalized provider articles are removed by `provider + externalId` before persistence, preserving their first-provider order. Each remaining article is then upserted in `articles` by the same unique index, with `fetchedAt` refreshed on every feed request. The API returns a provider-independent `FeedArticle` with the persisted MongoDB `_id` serialized as `id`, alongside `externalId`, and the current user's persisted `userState`; the mobile app never receives an ObjectId structure. This state is retrieved in one MongoDB query for all feed articles and is not created by a feed GET. `source` is currently a domain from TheNewsAPI, not an editorial display name, so it is deliberately used for both `sourceName` and `sourceDomain`. Provider categories are converted back to myNews topic slugs; `entertainment` maps to both `cinema` and `culture` because the provider cannot distinguish them.

## Failure handling and scope

Provider quota exhaustion (402) and rate limiting (429) become a generic `503 News provider unavailable`; other provider failures become `502 News provider unavailable`. Server logs contain only status and provider error code, never the token, signed URL, or provider message. Invalid successful payloads are also treated as a provider failure.

`FEED_LIMIT = 3` remains backend-owned. The provider metadata stays internal. The public response is:

```json
{
  "articles": [],
  "pagination": { "page": 1, "hasMore": false }
}
```

`hasMore` is calculated without exposing provider metadata: the current page must be full and `(page - 1) * limit + returned` must remain below `found`. Home uses an explicit **Voir plus d’articles** action to request the next page, appends only new persisted IDs, and refreshes by replacing the list with page 1. There is no prefetch, automatic pagination, polling, or cache.

Every provider request is restricted to the seven preceding UTC calendar days and explicitly sorted by `published_at`. This applies equally to keyword searches, for which the provider could otherwise prioritize relevance and return historical articles. An empty result remains empty; myNews does not silently widen the date window.

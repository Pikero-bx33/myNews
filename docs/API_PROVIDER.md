# News Provider

## MVP decision

TheNewsAPI is the single MVP provider. Its code is isolated in the backend so a later provider can be added without exposing a provider-specific format to the mobile app.

## Feed endpoint and provider request

`GET /api/v1/feed` is protected by Better Auth. It obtains the user ID from the server-validated session, loads that user's `userPreferences` document, then makes exactly one request to:

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

Topic mapping: `sport → sports`, `technology → tech`, `science → science`, `politics → politics`, `business → business`, `cinema → entertainment`, `culture → entertainment`, `food → food`, `health → health`.

No request is made when an authenticated user has no persisted preferences: the backend returns `409 { "error": "Preferences required" }`. This explicitly distinguishes incomplete onboarding from an empty provider result.

## Validation and normalization

`api/src/schemas/thenewsapi.ts` validates the successful raw response with Zod before it is normalized. It validates only the response metadata and article fields used by myNews: `uuid`, `title`, `description`, `url`, `image_url`, `language`, `published_at`, `source`, and `categories`. The provider error payload `{ error: { code, message } }` has its own Zod schema.

The normalizer returns `NormalizedArticle[]`. Each article is then upserted in `articles` by the unique `provider + externalId` index, with `fetchedAt` refreshed on every feed request. The API returns a provider-independent `FeedArticle` with the persisted MongoDB `_id` serialized as `id`, alongside `externalId`, and the current user's persisted `userState`; the mobile app never receives an ObjectId structure. This state is retrieved in one MongoDB query for all feed articles and is not created by a feed GET. `source` is currently a domain from TheNewsAPI, not an editorial display name, so it is deliberately used for both `sourceName` and `sourceDomain`. Provider categories are converted back to myNews topic slugs; `entertainment` maps to both `cinema` and `culture` because the provider cannot distinguish them.

## Failure handling and scope

Provider 400/401/402/403/5xx failures become a generic `502 News provider unavailable`; rate limiting (429) becomes `503 News provider unavailable`. Server logs contain only status and provider error code, never the token, signed URL, or provider message. Invalid successful payloads are also treated as a provider failure.

Sprint 4A persists normalized metadata only; it has no cache, pagination, multi-request batching, advanced ranking, state-toggle routes, or frontend state actions. Every feed request remains real-time and returns:

```json
{ "articles": [] }
```

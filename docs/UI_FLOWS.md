# UI Flows

## Onboarding preferences

```text
Authenticated user
→ GET /api/v1/preferences
├── preferences: null → Languages (at least one required)
│                        → Topics (at least one required)
│                        → Keywords (optional)
│                        → PUT /api/v1/preferences
│                        → Home
└── preferences exists → Home
```

The onboarding state is local to the onboarding route group. Protected API calls retrieve the Better Auth cookie with `authClient.getCookie()` and send it in the `Cookie` header. A saved preference document marks onboarding as complete for the current user.

## Personalized feed

```text
Home
→ GET /api/v1/feed
├── articles → Display article cards; tapping a card opens its URL in the system browser
├── [] → Empty-feed state
├── 409 Preferences required → Onboarding
└── network/provider error → Retry state
```

The Home list supports pull-to-refresh. Each refresh makes one new feed request; this stays deliberately simple while TheNewsAPI's free plan returns at most three articles per request.

Opening an article only opens the publisher URL. It does **not** mark the article as read; Favorite and Read / Unread will be separate explicit actions.

## Article state API

```text
Authenticated user
→ GET /api/v1/articles/:articleId/state
├── persisted state → return Favorite and Read values with timestamps
└── no persisted state → return false / false without creating a document

Authenticated user
→ PUT /api/v1/articles/:articleId/state
→ explicit Favorite and/or Read update
→ persist UserArticleState

Authenticated user
→ GET /api/v1/favorites
→ favorite articles, ordered by savedAt descending
```

Favorite and Read are independent. The feed receives each article's `userState` in its existing response, avoiding one state request per article.

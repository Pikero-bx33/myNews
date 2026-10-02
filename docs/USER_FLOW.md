# User Flow

This document records the user journeys implemented in myNews. It should be updated as new screens and product flows are added.

## Account creation to completed onboarding

```text
Register
→ Better Auth creates the user and session
→ authenticated app entry
→ preferences lookup
├── no preferences → onboarding
│   ├── content languages
│   ├── topics
│   └── optional keywords
│       → save preferences
│       → Home
└── preferences exist → Home
```

### 1. Register

The user opens the Register screen and submits a name, email address, and password. Better Auth creates the authentication user, email/password account, and session.

Relevant code:

- `front-app/app/(auth)/register.tsx`
- `front-app/lib/auth-client.ts`
- `back-api/api/src/lib/auth.ts`

### 2. Authenticated app entry

The root layout reads `authClient.useSession()`. A signed-in user can access the `(app)` route group; a signed-out user can access only `(auth)`.

Relevant code:

- `front-app/app/_layout.tsx`

### 3. First-login decision

`(app)/index` calls `GET /api/v1/preferences` using the Better Auth session cookie.

- `{ preferences: null }`: the user has not completed onboarding and is sent to Languages.
- `{ preferences: UserPreferences }`: the user has completed onboarding and is sent directly to Home.

Relevant code:

- `front-app/app/(app)/index.tsx`
- `front-app/lib/api/preferences.ts`
- `back-api/api/src/routes/v1/preferences.ts`

### 4. Onboarding

The onboarding route group holds temporary state in a local React Context:

```ts
{
  contentLanguages: ('fr' | 'en')[];
  topics: string[];
  keywords: string[];
}
```

The user must choose at least one content language and one topic. Keywords are optional, cannot be empty, and are deduplicated.

| Step | Screen | Requirement |
| ---- | ------ | ----------- |
| 1 | Languages | At least one of French and English. |
| 2 | Topics | At least one predefined topic. |
| 3 | Keywords | Optional custom keywords. |

Relevant code:

- `front-app/app/(app)/onboarding/_layout.tsx`
- `front-app/app/(app)/onboarding/languages.tsx`
- `front-app/app/(app)/onboarding/topics.tsx`
- `front-app/app/(app)/onboarding/keywords.tsx`

### 5. Save preferences and reach Home

When the user presses Finish, the app sends the selected languages, topics, and keywords to `PUT /api/v1/preferences`. The backend gets the user ID from the Better Auth session, upserts the `userPreferences` document, then the mobile app navigates to Home after a successful response.

Relevant code:

- `front-app/lib/api/preferences.ts`
- `front-app/app/(app)/onboarding/keywords.tsx`
- `back-api/api/src/routes/v1/preferences.ts`
- `back-api/api/src/models/userPreferences.ts`

### 6. Returning user

After an app restart or a new login, Better Auth restores the session through Secure Store. The preferences lookup finds the persisted document, so the user goes directly to Home instead of repeating onboarding.

## Personalized news feed

### 7. Load the personalized feed

When the user reaches Home, the app sends `GET /api/v1/feed` with the Better Auth session cookie. The backend uses the saved preferences to retrieve and normalize relevant articles before returning them to the mobile app.

- Articles available: Home displays one card per article with its image (or a fallback), source, date, title, optional description, and topics.
- No articles: Home explains that no article matches the current preferences.
- Preferences missing (`409`): the user is returned to the first onboarding step.
- Network or provider error: Home displays an error message and a Retry action.

The user can pull down the list to request a fresh feed. Tapping an article card opens the publisher's URL in the device's system browser.

Relevant code:

- `front-app/app/(app)/home.tsx`
- `front-app/components/feed/article-card.tsx`
- `front-app/lib/api/feed.ts`
- `back-api/api/src/routes/v1/feed.ts`

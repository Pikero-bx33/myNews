# MVP Scope

## Included

- Better Auth email/password authentication and persistent native sessions
- Preference onboarding: French/English content languages, topics and optional keywords
- Preference editing with persisted source settings preserved
- Personalized TheNewsAPI feed, limited to the last seven days and ordered by publication date
- Manual Load More pagination, Favorites and explicit Read / Unread state
- Saved articles and opening original publisher URLs

## Product rules

- At least one content language and one topic are required.
- Keywords are optional, trimmed and deduplicated case-insensitively.
- Opening an article does not mark it as read.
- Favorite and Read are independent persisted states.
- The mobile app never receives provider credentials or raw provider objects.

## Deliberately outside the MVP

- Search, Explore, notifications, comments and social features
- AI ranking, provider fallback, caching and infinite scroll
- Source-selection UI, production deployment and store releases
- Final opaque iOS icon and dedicated Android production adaptive icon assets

## Completion criteria

The MVP is functionally complete when a user can authenticate, complete or edit preferences, consult recent personalized articles, load another page manually, open an article, manage Favorite and Read states, and retrieve Saved articles across sessions.

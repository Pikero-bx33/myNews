# Project Log

## 2026-10-05 — Sprint 4B: user article state API

**Goal:** Add protected backend APIs for explicit Favorite and Read / Unread state, favorites retrieval, and feed state enrichment.

**Changes:** Added protected article-state GET/PUT routes with strict Zod validation and ObjectId validation; added the favorites endpoint ordered by `savedAt` descending; and enriched the feed response with a provider-independent `userState` through one MongoDB lookup for all returned articles.

**Decisions:** Favorite and Read remain independent. Toggling either updates only its matching timestamp (`savedAt` or `readAt`); opening an article never marks it read. GET endpoints never create a state document, while an explicit PUT upserts one and retains it even when both flags are false. No frontend controls were added.

**Verification:** Backend TypeScript, production build, development-server startup, and scoped diff validation were run. Runtime route validation remains required with a real Better Auth session and already-persisted articles, without unnecessary provider requests.

**Next steps:** Sprint 4C can connect Favorite and Read controls to these APIs, add the Saved screen, and introduce the planned bottom navigation.

## 2026-10-05 — Sprint 4A: article persistence foundation

**Goal:** Persist the normalized articles returned by the feed and create the data model required for future independent Favorite and Read / Unread actions.

**Changes:** Added `articles` with the normalized metadata needed by myNews and a unique `provider + externalId` index; added `userArticleStates` with the unique `userId + articleId` index; and updated `GET /api/v1/feed` to upsert normalized provider articles, refresh `fetchedAt`, and return their MongoDB ID as a string `id`.

**Decisions:** The feed remains real-time and stores no full article content. The MongoDB `id` supplements rather than replaces the provider `externalId`. No state endpoints or frontend changes were added. Opening an article does not mark it as read; `isFavorite` and `isRead` are explicit, independent flags.

**Verification:** Backend TypeScript validation and scoped diff validation were run. Persisted feed behavior requires runtime validation against MongoDB with an authenticated session and a provider key.

**Next steps:** Sprint 4B can add protected backend endpoints for explicit favorite and read-status updates.

## 2026-10-02 — Sprint 3C: first personalized mobile feed

**Goal:** Connect the React Native Home screen to the protected feed endpoint and display the first real personalized articles.

**Changes:** Added the frontend `getFeed()` API helper and normalized article type; reused the Better Auth cookie-header helper already used by preferences; replaced the Home placeholder with a pull-to-refresh `FlatList`; and added reusable article cards with remote-image fallback, publication date, source, title, optional description/topics, and system-browser opening.

**Decisions:** The frontend keeps its own provider-independent article contract instead of importing backend code. A `409 Preferences required` sends the user back to onboarding, while provider/network failures retain a Retry state. No frontend cache or pagination was added because the current free plan returns only three articles per request.

**Verification:** TypeScript, ESLint, and scoped diff validation were run. Runtime device validation remains required with a valid Better Auth session and provider key.

**Next steps:** Validate loading, refresh, error, empty, image fallback, and article opening on a device or simulator; then add article state features only when approved.

## 2026-10-02 — Sprint 3B: first personalized backend feed

**Goal:** Deliver the first protected real-time feed from persisted preferences through TheNewsAPI, while keeping the mobile app independent from provider data.

**Changes:** Added runtime validation for `THE_NEWS_API_KEY`; a TheNewsAPI client that builds one URL-safe request; raw success and error Zod schemas; article normalization; and `GET /api/v1/feed`. The request maps languages, de-duplicated categories, simple keyword OR search, and optional included/excluded source domains. Documentation now records the live endpoint and its constraints.

**Decisions:** A user without persisted preferences receives `409 Preferences required` and no provider call. The free-plan limit is the explicit `FEED_LIMIT = 3`. Provider failures return a generic 502, except rate limiting which returns 503; no token, signed URL, or provider message is sent to the client. TheNewsAPI's domain-valued `source` is used for both source fields, and `entertainment` maps back to both `cinema` and `culture`.

**Verification:** `yarn tsc --noEmit`, `yarn build`, and scoped `git diff --check` passed. One real provider request returned HTTP 200, passed Zod validation, returned three articles, and successfully normalized its first article. `yarn dev` connected and served port 3001; the unauthenticated feed route returned 401. Authenticated and missing-preferences route cases require an available Better Auth session and were not fabricated.

**Next steps:** Sprint 3C can connect the mobile feed UI, then consider cache/pagination/ranking only when product needs justify them.

## 2026-09-29 — Sprint 3A: news provider decision and contract

**Goal:** Select the MVP news provider and define a provider-independent normalized article contract before feed implementation.

**Changes:** Selected TheNewsAPI for the MVP; documented its free-plan limit, language/category/search/domain strategy, topic mapping, GNews fallback, and the `NormalizedArticle` contract. Added backend-only provider constants, the normalized type, and `THE_NEWS_API_KEY` to the environment example.

**Decisions:** TheNewsAPI is the sole MVP provider despite its current 3-article free-plan limit. `cinema` and `culture` both map to `entertainment`. The provider raw response, Zod parsing, network calls, feed route, cache, and frontend feed remain deferred to Sprint 3B.

**Verification:** TypeScript validation and diff validation were run. No external news request or frontend change was made.

## 2026-09-28 — Sprint 2C: persisted onboarding

**Goal:** Connect preference onboarding to the protected preferences API and route authenticated users according to persisted preferences.

**Changes:** Updated GET preferences to return an explicit nullable response; added the mobile preferences API helper with the Better Auth cookie; persisted the completed onboarding payload through PUT; and routed first-login users to onboarding while returning users go directly to Home.

**Decisions:** The root layout remains responsible only for authentication. `(app)/index` owns the preference lookup and shows a loading or retry state while it resolves. Onboarding is marked complete only after the backend PUT succeeds.

**Verification:** Backend and Expo checks, TypeScript, ESLint, and diff validation were run. Manual physical-device validation remains the next step.

## 2026-09-28 — Sprint 2B: preferences onboarding UI

**Goal:** Build the authenticated three-step preference onboarding flow without connecting it to the backend yet.

**Changes:** Added Languages, Topics, and optional Keywords screens, with simple progress feedback, Back navigation, and minimum selection validation for languages and topics. A route-group-local React Context shares the temporary state during the flow.

**Decisions:** Redux is not used because this state only exists during onboarding. Finish navigates to an authenticated placeholder; no preferences API call or onboarding-completion persistence is made until Sprint 2C.

**Verification:** Expo checks, TypeScript, ESLint, and diff validation were run. No backend or authentication routing changes were made.

## 2026-09-28 — Sprint 2A: user preferences backend

**Goal:** Create the authenticated backend foundation for persisted user preferences, without onboarding UI.

**Changes:** Added the `userPreferences` Mongoose collection and protected `GET`/`PUT /api/v1/preferences` routes. Preferences use the Better Auth UUID through `userId: string`; Zod validates and normalizes the preference arrays before an upsert.

**Decisions:** GET returns a non-persisted default preference object when no document exists, keeping reads side-effect free and simplifying future onboarding. PUT replaces the complete preference resource and uses a simple upsert. The user ID always comes from the Better Auth session, never from the request body.

**Verification:** TypeScript build and route-level checks were run. No frontend or onboarding UI was added.

## 2026-09-13 — Sprint 1: Better Auth email/password avec Expo

**Goal:** Deliver and validate the email/password authentication foundation on a physical iPhone.

**Changes:** Migrated the frontend from Expo SDK 54 to SDK 57; integrated Better Auth Expo with Secure Store; configured the API through `EXPO_PUBLIC_API_URL`; added protected `(auth)` and `(app)` route groups with minimal Login, Register, and authenticated screens.

**Decisions:** Better Auth remains the sole source of truth for mobile authentication. Secure Store persists the session; Redux remains reserved for future business state. Google OAuth was studied and intentionally deferred to post-MVP: it requires a Development Build, Apple provisioning, and a public HTTPS backend for correct iPhone testing.

**Verification:** Expo Doctor passed 21/21. On a physical iPhone 14 Pro, signup, signin, signout, protected routing, and session restoration after fully closing and reopening the app were validated against Express and MongoDB Atlas.

## 2026-09-12 — Sprint 0 frontend: cleanup and Expo SDK alignment

**Goal:** Simplify the initial frontend setup and align its Expo dependencies with SDK 54, while preserving Expo Router and the current application behavior.

**Changes:** Removed the unused root `front-app/App.tsx` and `front-app/index.ts`; removed Axios and its unused transitive dependencies; aligned `expo-font` from 55.0.6 to 14.0.12; aligned `expo`, `expo-constants`, `expo-linking`, `expo-router`, and `expo-web-browser` with the recommended Expo SDK 54 patch versions. Expo also added the `expo-web-browser` config plugin to `front-app/app.json`.

**Decisions:** Keep `expo-router/entry` as the entry point. Retain Redux Toolkit and React Redux for future shared state when needed. Retain Inter as the chosen design font, although it is not loaded yet. Leave Better Auth unchanged. Keep the `expo-web-browser` plugin added automatically by Expo for native configuration. Record sprint summaries at closure, before the final commit, rather than after each intermediate step.

**Verification:** `yarn tsc --noEmit --incremental false`, `yarn eslint . --no-cache`, `yarn expo install --check`, and `git diff --check` passed after the final alignment. Expo reports that dependencies are up to date. Reviewed the diff to confirm the approved scope. No device or simulator runtime test was performed.

**Issues and next steps:** Sandbox network restrictions required an online retry for the Expo alignment. Yarn peer-dependency warnings for `@babel/core`, `@opentelemetry/api`, and `@expo/metro-runtime` remain unresolved and were intentionally not addressed in this sprint. Verify rendering and navigation on a device or simulator in a later approved block. The next project phase is the backend foundation.

## 2026-09-12 — Sprint 0 backend: technical cleanup

**Goal:** Remove backend learning artifacts and make the build reproducible, while preserving Better Auth as the sole owner of identity and authentication.

**Changes:** Declared `zod` and `mongodb` as direct dependencies; removed the nested `back-api/api/node_modules`; added `scripts/clean-dist.mjs` and updated the build scripts so `dist/` is cleaned before compilation and `start` rebuilds before execution. Removed the unused root `back-api/auth.ts`; `api/src/lib/auth.ts` is now the unique Better Auth configuration. Removed the legacy User test domain (model, type, Zod schema, service, controller, routes) and its `/api/v1/users` mounting.

**Decisions:** Better Auth remains unchanged and uses `authUsers`, `authSessions`, and `authAccounts`. Future business collections will reference `authUsers.id` through `userId: string`; no application `Profile` collection is created until a concrete business need exists.

**Verification:** `yarn tsc --noEmit`, `yarn build`, and `git diff --check` passed after the cleanup. The generated build still mounts Better Auth on `/api/v1/auth/*splat`.

# AGENTS.md

## 1. Purpose

This file is the development contract for **myNews**.

It defines the stable rules that Codex or any other coding agent must follow when working on this repository.

It is not intended to replace the project documentation.

Detailed technical decisions belong in the relevant documents under `/docs`.

Before making significant changes, always inspect this file and the relevant documentation.

---

# 2. Project overview

**myNews** is a personalized mobile news application.

The application allows users to:

- create an account;
- authenticate securely;
- choose preferred content languages;
- select news topics;
- define optional custom keywords;
- receive a personalized news feed;
- open original news articles;
- save articles as favorites;
- manually mark articles as read or unread;
- edit preferences later;
- eventually browse more news, sources and categories.

The project is also a learning and portfolio project.

The codebase should therefore remain:

- understandable;
- explicit;
- maintainable;
- pedagogical;
- close to standard React / React Native / Express / MongoDB practices.

Avoid unnecessary abstraction or enterprise-style architecture when a simpler solution is sufficient.

---

# 3. Repository structure

Main structure:

```text
myNews/
├── AGENTS.md
├── README.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── DESIGN_SYSTEM.md
│   ├── UI_FLOWS.md
│   ├── USER_FLOW.md
│   ├── API_PROVIDER.md
│   ├── BETTER_AUTH.md
│   ├── PROJECT_LOG.md
│   └── screens/
│
├── front-app/
│   └── React Native / Expo application
│
└── back-api/
    └── Express / TypeScript API
```

Do not create parallel architecture or duplicate documentation when an appropriate existing file already exists.

---

# 4. Documentation responsibilities

Each document has a specific role.

## `AGENTS.md`

Stable development rules for agents.

Contains:

- coding principles;
- workflow rules;
- architecture constraints;
- security requirements;
- project conventions.

Do not turn this file into a sprint log.

---

## `docs/ARCHITECTURE.md`

Describes the technical architecture of the application.

Use it for:

- system boundaries;
- frontend/backend responsibilities;
- authentication architecture;
- API flows;
- feed architecture;
- provider boundaries;
- major architectural choices.

---

## `docs/DATA_MODEL.md`

Source of truth for MongoDB business data.

Use it for:

- collections;
- fields;
- relationships;
- IDs;
- indexes;
- data ownership.

---

## `docs/DESIGN_SYSTEM.md`

Source of truth for UI direction.

Use it for:

- colors;
- spacing;
- typography;
- component style;
- interaction principles;
- visual consistency.

---

## `docs/UI_FLOWS.md`

Technical screen/navigation flows.

Keep it synchronized when navigation or important screen flows change.

---

## `docs/USER_FLOW.md`

Simple product-level description of the user journey.

It should remain easier to read than `UI_FLOWS.md`.

Update it when a major user-facing workflow changes.

---

## `docs/API_PROVIDER.md`

Source of truth for external news provider integration.

Contains:

- provider decision;
- limits;
- mapping;
- request strategy;
- normalization contract;
- fallback strategy.

---

## `docs/BETTER_AUTH.md`

Pedagogical explanation of the real Better Auth implementation in myNews.

Use it as the detailed authentication tutorial.

---

## `docs/PROJECT_LOG.md`

Chronological project development log.

Update it at the end of:

- a sprint;
- a significant sprint block;
- a meaningful architectural milestone.

Do **not** update it after every small change.

Entries should remain concise.

---

# 5. Technology stack

## Mobile

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- React
- Redux Toolkit / React Redux
- Better Auth Expo integration
- Expo Secure Store
- Expo Image
- Expo Web Browser
- native `fetch()`

Do not introduce Axios unless there is a concrete requirement that native `fetch()` cannot reasonably solve.

---

## Backend

- Node.js
- Express 5
- TypeScript
- Mongoose
- MongoDB Atlas
- Zod
- Better Auth
- native Node `fetch()`
- `tsx` for development execution

---

## Database

MongoDB Atlas.

Business data is managed with Mongoose.

Better Auth uses MongoDB through its own adapter.

---

# 6. Runtime / local environment

Use `nvm` to avoid Node compatibility problems.

Known working environments:

```text
Backend:
Node 20.x

Frontend / Expo SDK 57:
Node 22.23.x
```

Do not assume the same Node version must be used for both applications.

Before debugging application code, verify:

```bash
node -v
which node
which yarn
```

Yarn should preferably come from the active nvm Node installation, not from an old `~/.npm-global` installation.

Do not recreate nested `node_modules` folders such as:

```text
back-api/api/node_modules
```

Backend dependencies belong in:

```text
back-api/node_modules
```

Frontend dependencies belong in:

```text
front-app/node_modules
```

---

# 7. General coding philosophy

Prefer:

- simple functions;
- explicit data flow;
- small focused modules;
- clear naming;
- standard framework conventions;
- TypeScript types;
- Zod validation at external boundaries.

Avoid:

- premature abstractions;
- unnecessary classes;
- repository layers without a real need;
- dependency injection frameworks;
- complex design patterns for simple CRUD operations;
- duplicated state;
- duplicated business logic;
- speculative features.

The project should remain understandable by a junior-to-intermediate full-stack JavaScript developer.

---

# 8. TypeScript rules

Use strict TypeScript.

Existing configuration uses NodeNext on the backend.

Respect current module conventions.

Backend imports generally use `.js` extensions in TypeScript source when required by NodeNext:

```ts
import { auth } from "./lib/auth.js";
```

Do not change module strategy without a concrete reason.

Avoid:

```ts
any
```

unless absolutely necessary and justified.

Prefer explicit domain types.

---

# 9. Authentication

Authentication is handled by **Better Auth**.

Better Auth is the only source of truth for authentication/session state.

Do not:

- create custom JWT authentication;
- duplicate auth session state in Redux;
- store auth tokens manually;
- implement a parallel authentication system.

Detailed behavior is documented in:

```text
docs/BETTER_AUTH.md
```

---

# 10. Better Auth database collections

Better Auth uses:

```text
authUsers
authSessions
authAccounts
```

Configured explicitly through Better Auth.

Better Auth user IDs are generated as UUID strings.

Therefore:

```ts
authUsers.id: string
```

This is not a MongoDB ObjectId.

All business collections referencing the authenticated user must use:

```ts
userId: string
```

Do not convert Better Auth UUIDs into MongoDB ObjectIds.

---

# 11. Authentication flow

Current authentication supports:

- email/password registration;
- email/password login;
- logout;
- persistent native sessions.

Google OAuth was investigated but intentionally deferred post-MVP.

Do not reintroduce Google OAuth unless explicitly requested.

---

# 12. Session persistence

Native authentication persistence is handled through Better Auth + Expo integration + Secure Store.

Do not duplicate session persistence with Redux Persist.

Auth flow conceptually:

```text
App
→ Better Auth client
→ Secure Store
→ backend session validation
→ authClient.useSession()
→ route guard
```

The root route guard uses:

```ts
authClient.useSession()
```

Authentication state must remain outside Redux.

---

# 13. Frontend routing

Current high-level structure:

```text
(auth)
├── login
└── register

(app)
├── onboarding
├── home
└── future authenticated screens
```

The root auth guard determines whether `(auth)` or `(app)` is available.

Do not mix authentication decisions with business onboarding decisions.

Responsibilities:

```text
Root layout
→ authentication status

App entry
→ preferences/onboarding status
```

---

# 14. User onboarding

Current onboarding collects:

1. content languages;
2. topics;
3. optional keywords.

Required:

```text
at least one content language
at least one topic
```

Optional:

```text
keywords
preferred sources
blocked sources
```

Supported content languages currently:

```text
fr
en
```

Users may select:

```text
FR only
EN only
FR + EN
```

Onboarding state may remain local while the flow is active.

Persisted preferences belong in MongoDB.

---

# 15. User preferences

MongoDB collection:

```text
userPreferences
```

Conceptual structure:

```ts
{
  userId: string;

  topics: string[];
  keywords: string[];

  contentLanguages: ("fr" | "en")[];

  preferredSources: string[];
  blockedSources: string[];

  createdAt: Date;
  updatedAt: Date;
}
```

`userId` must be unique.

The authenticated user ID must always come from the Better Auth session.

Never trust a user ID supplied by the frontend.

---

# 16. Preferences API

Current routes:

```text
GET /api/v1/preferences
PUT /api/v1/preferences
```

Protected routes must obtain the current session through Better Auth.

The frontend sends the Better Auth cookie using the existing Expo integration.

Do not allow users to select another `userId` in request payloads.

---

# 17. News provider

The MVP news provider is:

```text
TheNewsAPI
```

The provider is called exclusively from the backend.

The mobile application must never know:

- provider API token;
- provider URL;
- provider-specific raw response format.

Environment variable:

```env
THE_NEWS_API_KEY=
```

Backend only.

Never log or commit the real key.

---

# 18. Provider independence

The application architecture must remain provider-independent.

Current flow:

```text
Mobile
   ↓
GET /api/v1/feed
   ↓
backend
   ↓
user preferences
   ↓
TheNewsAPI client
   ↓
raw response
   ↓
Zod validation
   ↓
normalization
   ↓
application article format
   ↓
mobile
```

Do not expose raw TheNewsAPI objects directly to the frontend.

---

# 19. TheNewsAPI mapping

Current myNews topic mapping:

```text
sport       → sports
technology  → tech
science     → science
politics    → politics
business    → business
cinema      → entertainment
culture     → entertainment
food        → food
health      → health
```

`cinema` and `culture` temporarily share the provider category:

```text
entertainment
```

Do not introduce a custom classification engine unless required later.

---

# 20. Languages sent to provider

Convert:

```ts
["fr"]       → "fr"
["en"]       → "en"
["fr", "en"] → "fr,en"
```

Backend owns this transformation.

Frontend does not perform provider filtering.

---

# 21. Keywords

Current MVP strategy:

Multiple keywords are combined into a simple OR provider search.

Example:

```text
AI | surfing | Tesla
```

Do not build complex boolean search logic yet.

---

# 22. Sources

Future source preferences map conceptually to:

```text
preferredSources → domains
blockedSources   → exclude_domains
```

Keep this logic backend-side.

---

# 23. Feed API

Current protected route:

```text
GET /api/v1/feed
```

Flow:

```text
request
→ Better Auth session
→ user ID
→ userPreferences
→ provider request
→ Zod validation
→ normalized articles
→ persist article metadata
→ return feed
```

If preferences do not exist:

```text
409 Preferences required
```

No provider request should be made.

---

# 24. Current provider quota strategy

TheNewsAPI free plan currently limits development to a small number of articles per request.

The MVP currently requests:

```text
3 articles
```

Do not introduce aggressive automatic polling.

A provider request should currently happen only when necessary, for example:

- initial feed load;
- explicit pull-to-refresh;
- future explicit pagination/load-more action.

Do not add periodic refresh in the background.

---

# 25. Article normalization

The application uses a provider-independent normalized article format.

Conceptually:

```ts
type NormalizedArticle = {
  externalId: string;
  provider: "thenewsapi";

  title: string;
  description: string | null;

  articleUrl: string;
  imageUrl: string | null;

  sourceName: string;
  sourceDomain: string;

  publishedAt: string;

  language: string;
  topics: string[];
};
```

After persistence, feed articles also expose:

```ts
id: string;
```

where `id` represents the MongoDB article `_id` serialized as a string.

`externalId` and `id` have different roles and must both be preserved.

---

# 26. Article persistence

Sprint 4A introduced persistent article metadata.

MongoDB collection:

```text
articles
```

Articles are identified uniquely by:

```text
provider + externalId
```

Unique index required.

Persisted metadata includes only information required by the application.

Do not store full copyrighted article content unless licensing explicitly permits it.

Current principle:

```text
store metadata
link to original source
```

---

# 27. Article model

Conceptual model:

```ts
interface Article {
  provider: "thenewsapi";
  externalId: string;

  title: string;
  description: string | null;

  articleUrl: string;
  imageUrl: string | null;

  sourceName: string;
  sourceDomain: string;

  publishedAt: Date;

  language: string;
  topics: string[];

  fetchedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

Feed calls upsert articles rather than creating duplicates.

---

# 28. User article state

MongoDB collection:

```text
userArticleStates
```

Purpose:

store user-specific interaction state separately from shared article metadata.

Conceptual model:

```ts
interface UserArticleState {
  userId: string;
  articleId: ObjectId;

  isFavorite: boolean;
  isRead: boolean;

  savedAt: Date | null;
  readAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
```

Unique index:

```text
userId + articleId
```

One user must have at most one state document for each article.

---

# 29. Favorite and Read semantics

Favorite and Read are independent.

Valid examples:

```text
isFavorite = true
isRead = false
```

and:

```text
isFavorite = false
isRead = true
```

Opening an article does **not** automatically mark it as read.

Read / Unread must be an explicit user action.

Favorite / Unfavorite must also be an explicit user action.

---

# 30. Persistent business state

MongoDB is the durable source of truth for:

- user preferences;
- articles;
- favorites;
- read/unread state;
- future cross-device user data.

Do not use Redux Persist as the authoritative storage for these values.

Redux may later mirror business state for UI responsiveness, but MongoDB remains authoritative.

This ensures persistence across:

- app restart;
- logout/login;
- device change;
- reinstall;
- future web/mobile clients.

---

# 31. Redux usage

Redux Toolkit is intentionally kept in the project because it may become useful for shared application state.

Do not use Redux automatically.

Use local component state when the state belongs to a single screen or short-lived flow.

Examples currently appropriate for local state:

```text
feed articles
loading
refreshing
error
onboarding temporary selections
```

Consider Redux only when state becomes genuinely shared across multiple independent areas.

Never use Redux to duplicate Better Auth state.

---

# 32. Redux Persist

Redux Persist is not the current durable storage strategy for core business data.

Do not persist:

```text
favorites
read state
preferences
auth sessions
```

with Redux Persist unless the architecture is explicitly changed later.

Database persistence and native auth persistence already solve these needs.

---

# 33. Feed mobile state

Current Home feed uses local React state.

Typical state:

```ts
articles
isInitialLoading
isRefreshing
errorMessage
```

This is intentional.

Do not introduce Redux just because a list comes from an API.

---

# 34. Pull-to-refresh

Home uses native React Native pull-to-refresh.

Because the provider currently returns only a few articles, the list may be shorter than the screen.

The current implementation therefore uses an explicit native refresh control and vertical bouncing.

A refresh:

```text
gesture
→ getFeed()
→ GET /api/v1/feed
→ updated articles
```

Do not add automatic polling.

---

# 35. Article opening

Opening an article should open the original external article.

Use:

- system browser;
- or Expo Web Browser.

Do not build an internal WebView unless explicitly requested later.

Do not infer `isRead = true` from article opening.

---

# 36. Planned main navigation

Target MVP bottom navigation:

```text
Home
Saved
Profile
```

Conceptually:

```text
Home     → personalized feed
Saved    → favorite articles
Profile  → account + preferences + logout
```

A future fourth tab may be:

```text
Explore
```

but do not introduce it until the Explore/Search feature actually exists.

---

# 37. UI design direction

The app should feel:

- modern;
- trustworthy;
- editorial;
- clean;
- mobile-first;
- readable.

Avoid:

- excessive gradients;
- heavy shadows;
- visual clutter;
- social-media-style density;
- unnecessary animation.

---

# 38. Design tokens

Current core palette:

```text
Primary        #2563EB
Primary light  #3B82F6
Primary soft   #DBEAFE

Background     #F9FAFB
Surface        #FFFFFF

Text primary   #111827
Text secondary #6B7280

Border         #E5E7EB

Success        #10B981
Error          #EF4444
```

Typical radius:

```text
10–12px
```

Use generous spacing and strong hierarchy.

---

# 39. Typography

Inter is the selected app font.

Do not remove `@expo-google-fonts/inter` simply because Google OAuth is not used.

The package is unrelated to Google authentication.

---

# 40. UI implementation principles

Prefer reusable components only when reuse or clarity is real.

Good examples:

```text
ArticleCard
SelectableChip
OnboardingScreen
```

Avoid splitting every small view into its own component.

Do not over-componentize.

---

# 41. Safe Area

All important mobile screens must respect device safe areas.

Do not use model-specific fixed top padding.

Prefer:

```text
react-native-safe-area-context
useSafeAreaInsets()
SafeAreaProvider
```

when appropriate.

---

# 42. API calls from mobile

Use native `fetch()`.

Protected API calls must use the existing Better Auth cookie mechanism.

Conceptually:

```ts
const cookie = authClient.getCookie();
```

then:

```text
Cookie: <cookie>
```

Do not manually persist this cookie elsewhere.

Do not expose it in logs.

---

# 43. API design principles

Routes should remain simple REST endpoints.

Current API version prefix:

```text
/api/v1
```

Prefer clear resource-based paths.

Do not introduce GraphQL unless explicitly required.

---

# 44. Authentication on protected routes

Protected backend routes must derive the user from the Better Auth session.

Conceptual pattern:

```ts
const session = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers),
});
```

Then:

```ts
session.user.id
```

Do not trust:

```text
req.body.userId
req.query.userId
req.params.userId
```

for authorization.

---

# 45. Express naming convention

Prefer conventional Express names:

```ts
req
res
```

rather than:

```ts
request
response
```

unless a file already has a strong local convention.

Consistency matters more than personal preference.

---

# 46. Zod validation

Use Zod at external data boundaries.

Examples:

- request bodies;
- provider responses;
- environment values when appropriate.

Prefer `.strict()` when unexpected properties should be rejected.

Normalize simple values where useful:

- trim strings;
- reject empty strings;
- deduplicate arrays.

Avoid complex validation rules before the product requires them.

---

# 47. Error handling

Prefer simple, predictable API errors.

Typical cases:

```text
400 validation error
401 unauthenticated
404 resource not found
409 business state conflict
500 unexpected server error
502 provider unavailable
503 temporary provider/rate-limit issue
```

Do not expose:

- stack traces;
- internal secrets;
- provider API keys;
- signed provider URLs;
- session cookies.

Server logs may contain concise diagnostic information, but never secrets.

---

# 48. Secrets

Secrets belong only in local backend environment files or deployment secret stores.

Never commit:

```text
MongoDB URI
database password
Better Auth secret
TheNewsAPI key
OAuth secrets
tokens
```

`.env.example` may contain variable names only.

Example:

```env
MONGO_URI=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
THE_NEWS_API_KEY=
PORT=
```

---

# 49. Environment files

Frontend public variables may use Expo public variables when required:

```env
EXPO_PUBLIC_API_URL=
```

Never put server secrets in an `EXPO_PUBLIC_*` variable.

Anything prefixed with `EXPO_PUBLIC_` must be considered visible to the client.

---

# 50. Development networking

A real iPhone must be able to reach the local backend.

Typical development URL:

```text
http://<MAC_LAN_IP>:3001
```

The Metro URL and backend URL use different ports.

Example:

```text
Metro:
exp://172.x.x.x:8081

Backend:
http://172.x.x.x:3001
```

Do not mistakenly use Metro port `8081` as backend API port.

---

# 51. MongoDB Atlas networking

Atlas Network Access may block local development when the public IP changes.

Diagnose connection errors before modifying database code.

Typical symptom:

```text
MongooseServerSelectionError
ReplicaSetNoPrimary
```

Development may temporarily use broad IP access if explicitly chosen, but production access must be restricted appropriately.

---

# 52. Backend scripts

Current intended backend scripts are conceptually:

```text
yarn dev
→ tsx watch ./api/src/index.ts

yarn build
→ clean dist + TypeScript compile

yarn start
→ build + execute compiled server
```

Do not reintroduce `ts-node/esm` unless there is a strong reason.

`tsx` replaced the older development runner for simplicity and Node compatibility.

---

# 53. Frontend scripts

Expo application starts with:

```bash
yarn start
```

Do not assume a `yarn dev` script exists in the frontend unless it has explicitly been added.

---

# 54. Generated directories

Generated folders such as:

```text
node_modules
dist
```

must never be committed.

Avoid placing temporary `node_modules` backups inside the Git repository.

If a backup is needed, move it outside the repo.

Large backup folders inside the repo can cause VS Code and Git to repeatedly scan thousands of files and create Git lock problems.

---

# 55. Git workflow

Do not commit or push unless the user explicitly requests it or the current task explicitly includes commit/push.

Before commit:

```bash
git status
```

Review exactly what will be included.

Avoid:

```bash
git add .
```

when unrelated files or temporary folders are present.

Prefer targeted `git add` when the worktree contains unrelated changes.

---

# 56. Commit philosophy

Prefer small meaningful commits grouped by concern.

Examples:

```text
feat(auth): finalize Sprint 1 email/password authentication

feat(onboarding): add user preferences flow

feat(feed): integrate TheNewsAPI personalized feed

feat(feed): display personalized news feed on mobile

docs: add user flow overview

chore(frontend): align Expo SDK dependencies
```

Do not rewrite shared/pushed Git history for minor commit-message imperfections unless explicitly requested.

---

# 57. Agent workflow before coding

For any meaningful feature or architectural change:

1. inspect relevant code;
2. inspect `AGENTS.md`;
3. inspect relevant `/docs`;
4. identify existing conventions;
5. explain the proposed change briefly;
6. modify the smallest reasonable scope;
7. run validation checks;
8. summarize files changed and decisions;
9. stop for user validation when requested.

Do not blindly implement based only on a prompt if the repository already contains relevant code.

---

# 58. Scope discipline

Do only what belongs to the requested sprint/block.

Do not silently add:

- extra libraries;
- extra screens;
- speculative features;
- refactors unrelated to the current task;
- new architecture layers.

If an adjacent improvement is useful but not required, mention it instead of implementing it automatically.

---

# 59. Dependency policy

Before adding a package, ask:

```text
Can existing platform/framework functionality solve this cleanly?
```

Prefer built-in capabilities.

Examples:

```text
fetch instead of Axios
Intl / Date instead of date library for simple formatting
React Context instead of Redux for temporary local flow state
```

Add a dependency only when its value is clear.

---

# 60. Frontend dependency health

For Expo dependencies:

```bash
npx expo install --check
npx expo-doctor@latest
```

Prefer versions recommended by the installed Expo SDK.

Do not manually force dependency resolutions merely to hide a transient Expo Doctor warning unless compatibility is understood.

---

# 61. Standard backend checks

After meaningful backend changes, run:

```bash
yarn tsc --noEmit
yarn build
git diff --check
```

When appropriate:

```bash
yarn dev
```

and confirm:

```text
MongoDB connected
Server running on port 3001
```

---

# 62. Standard frontend checks

After meaningful frontend changes, run:

```bash
yarn tsc --noEmit --incremental false
yarn lint
git diff --check
```

Also run when relevant:

```bash
npx expo-doctor@latest
```

Manual testing on a real iPhone is required for native interactions when appropriate.

---

# 63. Manual test philosophy

Automated/static checks are necessary but not sufficient.

For mobile features, manually validate important user flows on a physical device whenever possible.

Examples:

- login;
- session persistence;
- onboarding;
- feed loading;
- refresh gesture;
- external article opening;
- favorites;
- read/unread;
- bottom navigation.

---

# 64. Logging

Temporary debugging logs are allowed during investigation.

Examples:

```ts
console.log("Feed refresh triggered");
```

Remove temporary diagnostic logs before sprint closure unless they serve an intentional operational purpose.

Never log:

- auth cookies;
- passwords;
- tokens;
- API keys;
- full secret URLs.

---

# 65. Current completed milestones

Major completed work includes:

```text
Sprint 0
Repository/frontend/backend cleanup

Sprint 1
Better Auth email/password
session persistence
protected routing
Expo SDK 57 migration

Sprint 2A
User preferences backend

Sprint 2B
Onboarding UI

Sprint 2C
Preferences persistence and first-login routing

Sprint 3A
TheNewsAPI provider decision
provider-independent article contract

Sprint 3B
Real TheNewsAPI integration
Zod validation
normalized backend feed

Sprint 3C
Real mobile feed UI
ArticleCard
loading/error/empty states
external article opening
pull-to-refresh

Sprint 4A
Article persistence
UserArticleState data model
persistent article IDs
```

---

# 66. Current development focus

Next planned block:

```text
Sprint 4B
User article state API
```

Expected scope:

- favorite state;
- read/unread state;
- timestamps;
- protected article-state routes;
- favorites retrieval.

Then:

```text
Sprint 4C
Mobile favorite/read controls
Saved screen
Bottom navigation
Profile foundation
```

---

# 67. Planned navigation

Target bottom tabs for Sprint 4C:

```text
Home
Saved
Profile
```

Do not add Explore until the feature exists.

---

# 68. Planned visual sprint

After functional Sprint 4:

```text
Sprint 5
Visual identity and UI redesign
```

Expected work:

- myNews logo;
- app icon;
- final visual identity;
- Home redesign;
- onboarding redesign;
- preferences/profile redesign;
- bottom navigation polish.

Do not prematurely mix this redesign into backend state work.

---

# 69. Planned feed scaling

Later:

```text
Sprint 6
Pagination / Load More
```

Potential scope:

- provider page parameter;
- more than 3 articles;
- Load More / infinite scroll;
- deduplication;
- caching strategy;
- quota management;
- improved ranking.

Do not implement automatic multi-page provider calls before this sprint unless explicitly requested.

---

# 70. MVP boundaries

Current MVP prioritizes:

- secure authentication;
- onboarding;
- personalized preferences;
- personalized feed;
- favorites;
- read/unread;
- article opening;
- preferences editing;
- clear navigation.

Post-MVP / later features may include:

- Google OAuth;
- comments;
- ratings;
- social/community features;
- AI summaries;
- advanced recommendations;
- notifications;
- complex ranking;
- multiple news providers;
- Explore/search;
- admin tools.

Do not move post-MVP functionality into current sprints without explicit approval.

---

# 71. Learning objective

This project is not only about producing working software.

It must remain understandable enough that the developer can explain:

- why architectural decisions were made;
- how authentication works;
- how data flows;
- how MongoDB relationships work;
- how external APIs are normalized;
- why state belongs locally, in Redux, Secure Store or MongoDB;
- how frontend and backend responsibilities are separated.

When multiple solutions are possible, prefer the solution that balances good engineering with educational clarity.

---

# 72. Agent communication

When completing a meaningful block, report:

1. files added;
2. files modified;
3. architecture choices;
4. important implementation details;
5. validation/check results;
6. manual tests still required;
7. deliberately deferred items.

Do not claim a feature is validated on a physical device unless it was actually tested there.

---

# 73. Final rule

When in doubt:

```text
Inspect first.
Reuse existing conventions.
Prefer the simplest correct solution.
Keep authentication and business data separated.
Keep secrets server-side.
Persist durable business state in MongoDB.
Avoid unnecessary dependencies and abstractions.
Document important decisions.
Do not silently expand scope.
```

myNews should evolve incrementally, sprint by sprint, while remaining understandable, testable and portfolio-ready.
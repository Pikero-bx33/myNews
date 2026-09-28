# Project Log

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

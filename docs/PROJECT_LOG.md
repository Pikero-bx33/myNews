# Project Log

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

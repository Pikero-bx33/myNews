# Project Log

## 2026-09-12 — Sprint 0 frontend: initial cleanup block

**Goal:** Simplify the initial frontend setup while preserving Expo Router and the current application behavior.

**Changes:** Removed the unused root `front-app/App.tsx` and `front-app/index.ts`; removed Axios and its unused transitive dependencies; aligned `expo-font` from 55.0.6 to 14.0.12 for Expo SDK 54.

**Decisions:** Keep `expo-router/entry` as the entry point. Retain Redux Toolkit and React Redux for future shared state when needed. Retain Inter as the chosen design font, although it is not loaded yet. Leave Better Auth and other Expo packages unchanged. Record sprint summaries at closure, before the final commit, rather than after each intermediate step.

**Verification:** `yarn tsc --noEmit --incremental false`, `yarn eslint . --no-cache`, and `git diff --check` passed. Reviewed the diff to confirm the approved scope. No device or simulator runtime test was performed.

**Issues and remaining work:** Sandbox network restrictions required online installation retries. `yarn expo install --check` no longer flags `expo-font`, but still recommends updates to Expo, Constants, Linking, Router, and Web Browser. Yarn peer-dependency warnings for `@babel/core`, `@opentelemetry/api`, and `@expo/metro-runtime` remain unresolved. Review these separately and verify rendering and navigation on a device or simulator in a later approved block.

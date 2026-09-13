# Better Auth in myNews

This document explains the email/password authentication architecture that is currently implemented in myNews. It is a project-specific guide: it describes our files, routes, collections, and mobile behaviour rather than every feature offered by Better Auth.

## Overview

myNews uses Better Auth to handle identity and authentication. It creates users, validates email/password credentials, creates sessions, and exposes client methods such as `signUp.email`, `signIn.email`, `signOut`, and `useSession`.

Better Auth does **not** implement the business domain of myNews. It does not manage news preferences, topics, articles, or favorites. Those future collections will use the authenticated Better Auth user ID when they need to belong to a user.

Authentication state is not stored in Redux. Better Auth and its Expo client are the source of truth for the session. Duplicating `user`, `session`, or an `isAuthenticated` flag in Redux would create two sources of truth that could disagree after a logout, an expired session, or an app restart.

## Global architecture

```text
iPhone / React Native app
        |
        | email/password HTTP requests
        v
authClient (Better Auth client)
        |                         \
        |                          \ session cookies / credentials
        v                           v
Express Better Auth handler     Expo Secure Store
        |
        | creates and validates sessions
        v
MongoDB Atlas
  - authUsers
  - authAccounts
  - authSessions

Expo Router consumes authClient.useSession()
        |
        +--> no session: (auth)
        +--> session:    (app)
```

The backend creates and validates the session. The Expo client keeps the session credentials securely on the device. The root Expo Router layout consumes the session state to expose the appropriate route group.

## Files and responsibilities

| File | Side | Role |
| ---- | ---- | ---- |
| `back-api/api/src/config/env.ts` | Backend | Loads environment variables and exposes the backend port, MongoDB URI, Better Auth secret, and Better Auth base URL. |
| `back-api/api/src/db/mongoClient.ts` | Backend | Creates the native MongoDB client used by the Better Auth MongoDB adapter. |
| `back-api/api/src/db/connectDB.ts` | Backend | Connects Mongoose during startup for current/future application models. It is not used by Better Auth itself. |
| `back-api/api/src/index.ts` | Backend | Starts both database connections, then starts Express. |
| `back-api/api/src/lib/auth.ts` | Backend | Creates the Better Auth instance: MongoDB adapter, collection names, email/password support, Expo plugin, trusted origins, and UUID IDs. |
| `back-api/api/src/app.ts` | Backend | Mounts Better Auth before `express.json()` at `/api/v1/auth/*splat`. |
| `front-app/lib/auth-client.ts` | Mobile | Creates the Better Auth React client, points it to the Express auth base path, and configures Secure Store through the Expo client plugin. |
| `front-app/app/_layout.tsx` | Mobile | Calls `authClient.useSession()` and protects the `(auth)` and `(app)` route groups. |
| `front-app/app/(auth)/_layout.tsx` | Mobile | Provides the stack navigator for Login and Register. |
| `front-app/app/(auth)/login.tsx` | Mobile | Collects email/password and calls `authClient.signIn.email(...)`. |
| `front-app/app/(auth)/register.tsx` | Mobile | Collects name/email/password and calls `authClient.signUp.email(...)`. |
| `front-app/app/(app)/_layout.tsx` | Mobile | Provides the stack navigator for authenticated screens. |
| `front-app/app/(app)/index.tsx` | Mobile | Displays basic session information and calls `authClient.signOut()`. |
| `front-app/app.json` | Mobile | Declares the `frontapp` scheme and native Expo plugins, including Secure Store. |

## Packages involved

| Package | Owner | Role in this project |
| ---- | ---- | ---- |
| `better-auth` | Better Auth | Server authentication engine and React client API. |
| `@better-auth/expo` | Better Auth | Server `expo()` plugin and mobile `expoClient()` plugin. It adapts Better Auth to Expo and native secure storage. |
| `expo-secure-store` | Expo | Native encrypted storage used by `expoClient()` for session cookies/credentials. |
| `expo-router` | Expo | File-based navigation and `Stack.Protected` route guards. |
| `expo-network` | Expo | Installed for the Better Auth Expo integration's network support; it is not imported directly by application screens. |
| `expo-linking` | Expo | Installed for Expo deep-link support. The current email/password flow does not call it directly. |
| `expo-web-browser` | Expo | Available for browser-based flows and used elsewhere by the app's external-link component. It is not part of the current email/password flow. |
| `expo-constants` | Expo | Installed Expo runtime configuration support; it is not imported directly by the current authentication screens. |

`better-auth` and `@better-auth/expo` provide authentication behaviour. Expo packages provide the native runtime services around it: routing, secure storage, device/network support, and linking infrastructure.

## Signup workflow

1. The user fills in name, email, and password on `app/(auth)/register.tsx`.
2. `handleSignUp` calls `authClient.signUp.email({ name, email, password })`.
3. The client sends the request to `${EXPO_PUBLIC_API_URL}/api/v1/auth`.
4. Express receives it through `app.all('/api/v1/auth/*splat', toNodeHandler(auth))`.
5. Better Auth validates and processes the registration. This behaviour comes from Better Auth, not from a custom controller in myNews.
6. Better Auth stores the new user, the email/password account record, and a new session in MongoDB.
7. The Expo client receives the session credentials and saves them through Secure Store.
8. `authClient.useSession()` observes the available session. The root route guard makes `(app)` available and removes `(auth)`.

The relevant MongoDB collections are:

| Collection | Purpose |
| ---- | ---- |
| `authUsers` | One logical application user, including the Better Auth UUID string ID. |
| `authAccounts` | The authentication method associated with a user. For this MVP, it represents the email/password account data managed by Better Auth. |
| `authSessions` | Active server-side sessions used to recognize a signed-in user. |

## Login workflow

1. The user enters email and password on `app/(auth)/login.tsx`.
2. `handleSignIn` calls `authClient.signIn.email({ email, password })`.
3. The request reaches the same Express Better Auth handler at `/api/v1/auth/*splat`.
4. Better Auth checks the credentials against its stored account data. A failed request returns an error that the screen displays.
5. After successful validation, Better Auth creates or restores a valid session and returns the required session credentials to the client.
6. `expoClient()` stores those credentials using Expo Secure Store.
7. `useSession()` changes from no session to a session, so the root layout exposes `(app)` automatically. The Login screen does not manage navigation with its own `isAuthenticated` state.

## Session persistence

In myNews, a session is the server-side proof that a previously authenticated user is still signed in. The session record exists in `authSessions` in MongoDB. The mobile app does not store a separate Redux session object or a manually managed token.

The Expo client plugin stores Better Auth session cookies/credentials in Expo Secure Store. Secure Store is native protected storage, so the values survive a JavaScript reload and a full app close. When the application opens again, Better Auth can use the stored credentials to retrieve and validate the current session with the backend.

```text
App restart
→ Better Auth client loads stored session credentials
→ getSession / useSession
→ backend validates session
→ session returned
→ (app) becomes available
```

This is why the iPhone can return directly to the authenticated area after Expo Go or the app is closed and reopened, as long as the server-side session remains valid and the phone can reach the backend.

## Logout workflow

1. The authenticated screen calls `authClient.signOut()`.
2. Better Auth sends the sign-out request to the Express handler.
3. Better Auth ends or invalidates the active server-side session according to its session handling.
4. The Expo client removes the associated stored credentials from Secure Store.
5. `useSession()` no longer returns a session.
6. The root `Stack.Protected` guard removes `(app)` and makes `(auth)` available. The user returns to Login automatically.

## Auth routing

The complete routing decision lives in `front-app/app/_layout.tsx`.

```ts
const { data: session, isPending } = authClient.useSession();
```

`isPending` means Better Auth is still resolving the initial session state. The layout shows only an activity indicator during this time. This prevents a short flash of Login for a user whose persisted session has not been loaded yet.

After loading:

* `session` is empty: `Stack.Protected guard={!session}` allows `(auth)` only.
* `session` exists: `Stack.Protected guard={Boolean(session)}` allows `(app)` only.

A route guard is a navigation rule that controls whether a route can be part of the current navigation tree. It is stronger and simpler than showing a Login screen conditionally inside every protected page. The guard is driven only by `authClient.useSession()`, so there is no competing authentication state.

## Environment variables and network

Never commit real values for these variables.

| Side | Variable | Purpose |
| ---- | ---- | ---- |
| Backend | `PORT` | Express port; the local development default is `3001`. |
| Backend | `MONGO_URI` | MongoDB Atlas connection string used by the native MongoDB client and Mongoose startup connection. |
| Backend | `BETTER_AUTH_SECRET` | Secret used by Better Auth to protect authentication data. It must remain server-side. |
| Backend | `BETTER_AUTH_URL` | Public base URL known by Better Auth; local development falls back to `http://localhost:3001`. |
| Frontend | `EXPO_PUBLIC_API_URL` | Base URL used by the mobile client before `/api/v1/auth` is appended. |

For a physical iPhone running a locally hosted backend, `localhost` means the iPhone itself, not the Mac. The frontend therefore uses the Mac's LAN address, for example:

```env
EXPO_PUBLIC_API_URL=http://<MAC_IP>:3001
```

The Mac and phone must be able to reach each other on the same local network (or a working shared connection), the backend must listen and be reachable on port `3001`, and MongoDB Atlas must allow the Mac's current public IP.

## Better Auth database model

`auth.ts` configures `generateId: () => crypto.randomUUID()`. Better Auth therefore gives each logical user an `authUsers.id` that is a UUID **string**. It is not a MongoDB `ObjectId`.

Future business collections must use that same type when they refer to the authenticated user. For example:

```ts
type UserPreferences = {
  userId: string; // references authUsers.id, a Better Auth UUID
  topics: string[];
  keywords: string[];
};
```

This avoids mixing a MongoDB document identifier with the logical user ID used by authentication and by mobile API requests.

## Security principles

* `BETTER_AUTH_SECRET` and `MONGO_URI` exist only on the backend.
* The frontend sends a password for signup/signin but never stores passwords itself.
* Production traffic must use HTTPS; local HTTP is only for controlled development testing.
* Secure Store is used for native session credentials instead of plain application storage.
* Better Auth owns session creation, validation, and sign-out.
* Redux must not duplicate tokens, users, sessions, or authentication flags.

## Debugging guide

| Symptom | Simple check | Likely solution |
| ---- | ---- | ---- |
| Backend cannot connect to MongoDB Atlas | Check the backend startup error and verify that `MONGO_URI` is present. | Correct the URI and confirm Atlas is running. |
| Atlas rejects the connection | Check Atlas Network Access. | Add the current public IP address of the network used by the Mac. |
| Login or register cannot reach the API | Compare `EXPO_PUBLIC_API_URL` with the Mac LAN IP and backend port. | Update the frontend `.env`, restart Expo, and use the current local IP. |
| The phone cannot reach the local backend | Open the backend URL from the phone's browser or inspect the network setup. | Put phone and Mac on a reachable network; check firewall and port `3001`. |
| Session is not restored after restart | Confirm Secure Store is configured in `auth-client.ts` and inspect whether the backend is reachable. | Keep the existing `expoClient`/Secure Store configuration and resolve backend connectivity or expired-session issues. |
| Expo dependencies do not work together | Run `npx expo-doctor@latest`. | Align dependencies with the installed Expo SDK and restart Expo with a cleared cache if needed. |
| `useSession()` stays in loading | Check the backend URL, backend logs, and device connectivity. | Fix the reachable API URL or backend failure; the hook cannot finish while its session request cannot complete. |

## Mental model

```text
Register/Login
→ Better Auth client
→ Express Better Auth route
→ MongoDB
→ session created or restored
→ Expo Secure Store
→ useSession()
→ protected app
```

Better Auth owns identity and sessions. Expo Secure Store preserves the mobile session. Expo Router reads that session and decides whether the user can enter the authenticated application.

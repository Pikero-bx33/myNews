# Deployment

## Deployment goals

myNews will expose one public HTTPS Express API used by both clients:

- Expo Web for the portfolio Live Demo;
- future iOS and Android native builds.

This document records the deployment architecture and the first public backend deployment. It does not replace local development instructions.

## Production architecture

```text
Portfolio
   │
   ▼
Expo Web
   │ HTTPS
   ▼
Express HTTPS API
   ├── MongoDB Atlas
   └── TheNewsAPI

Native app
   │ HTTPS
   └──────────────► same Express HTTPS API
```

The mobile and web clients never call TheNewsAPI directly. Better Auth remains the only authentication system, and MongoDB Atlas remains the durable source for business data.

## Environments

### Development

- Expo Go / local Metro.
- Local Express API on the Mac LAN or localhost.
- `EXPO_PUBLIC_API_URL` points to a reachable local API URL.
- Local environment files are not committed.

### Preview

- Future internal native build or preview web deployment.
- Public HTTPS backend with preview-specific origins and environment variables.
- Pending Sprint 7B/7E.

### Production

- Public Expo Web deployment.
- Public HTTPS API.
- Production-only secrets and exact public origins.

Development and production secrets, URLs, cookies, and origins must not be shared implicitly between environments.

## Backend deployment

### Recommended provider

**Render Web Service** is the recommended initial host for the existing Express API. It provides a conventional persistent Node HTTP service, HTTPS, environment variables, GitHub deployments, logs, and a root-directory setting for this repository layout. No serverless conversion is needed.

### Service settings

| Setting | Value for the current repository |
| --- | --- |
| Service type | Web Service |
| Root directory | `back-api` |
| Public API URL | `https://mynews-api-3gx9.onrender.com` |
| Node.js | `22.23.1` |
| Build command | `yarn install --frozen-lockfile --production=false && yarn build` |
| Start command | `yarn start` |
| Branch | `main` |
| Health check | `/health` |

The current backend scripts are:

```text
yarn build → yarn clean && tsc
yarn start → yarn build && node dist/index.js
```

`yarn start` starts the compiled server only. Render installs the locked dependencies, builds once, then starts the compiled server without a redundant compilation.

### Port

`env.port` already reads `process.env.PORT` and falls back to `3001` for local development. A Render Web Service must bind its public HTTP listener to the assigned `PORT` on `0.0.0.0`.

The server listens explicitly on `0.0.0.0:${PORT}`. `PORT` remains optional locally and defaults to `3001`; an invalid supplied port fails startup validation rather than silently using the fallback.

### Health check

`GET /health` is a public minimal endpoint returning `{ "status": "ok" }`. It does not require a session and does not query MongoDB or TheNewsAPI.

## Backend environment variables

| Variable | Current use | Production status |
| --- | --- | --- |
| `PORT` | Express listener port, local fallback `3001` | Platform-provided; do not hardcode |
| `MONGO_URI` | Mongoose and Better Auth MongoDB client | Required secret |
| `BETTER_AUTH_SECRET` | Better Auth signing/encryption secret | Required secret |
| `BETTER_AUTH_URL` | Better Auth public API base URL | Required public HTTPS API URL |
| `THE_NEWS_API_KEY` | Server-only TheNewsAPI request token | Required secret |
| `NODE_ENV` | Disables the development request logger and changes current Expo origin handling | Set to `production` in production |
| `CORS_ORIGINS` | Comma-separated browser origins allowed by Express CORS | Optional until Expo Web is deployed |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated additional Better Auth origins | Optional until Expo Web is deployed |

`back-api/.env.example` lists all seven variables and contains no real secret. Zod validates the required values (`MONGO_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `THE_NEWS_API_KEY`) at startup. `NODE_ENV` defaults to `development`; allowed values are `development`, `production`, and `test`.

Both origin variables are trimmed, split on commas, emptied values removed, and duplicates removed. `CORS_ORIGINS` never accepts wildcards; production also rejects wildcard entries in `BETTER_AUTH_TRUSTED_ORIGINS`.

## Better Auth production configuration

Current Better Auth configuration:

- backend `baseURL` is `BETTER_AUTH_URL`, configured in Render as `https://mynews-api-3gx9.onrender.com`;
- backend `basePath` is `/api/v1/auth`;
- native client base URL is `${EXPO_PUBLIC_API_URL}/api/v1/auth`;
- the Expo plugin uses scheme `frontapp` and Secure Store on native;
- trusted origins are `frontapp://`, `exp://` / `exp://**` outside production, and any exact values configured through `BETTER_AUTH_TRUSTED_ORIGINS`.

Before a web deployment, Sprint 7C must set the exact Expo Web origin in both origin variables. `frontapp://` remains supported for native builds; `exp://` patterns remain development-only. Do not retain localhost origins in a production Better Auth allowlist.

## CORS and trusted origins

Express CORS now uses `CORS_ORIGINS` and `credentials: true`. An exact configured browser origin receives CORS headers; an unlisted origin receives no permission headers. A request without an `Origin` header remains allowed so native Expo and non-browser requests are not artificially blocked.

For a future web deployment, configure a narrow environment-specific allowlist:

- local development origin(s);
- exact Expo Web preview/production origin(s);
- `credentials: true` only when browser cookies are required;
- only the methods and headers used by the API.

The same exact browser origins must be included in Better Auth `trustedOrigins`. CORS and `trustedOrigins` solve different checks and both are required.

## Cookies and web sessions

Native and Web cannot reuse the current data-request mechanism unchanged:

- Native uses `expoClient()` plus Expo Secure Store and manually forwards the stored session cookie to protected API routes.
- On Web, browsers manage cookies. JavaScript cannot reliably set the `Cookie` request header, and `expo-secure-store` has no browser storage implementation.
- A cross-origin browser client needs `credentials: 'include'`, exact credentialed CORS, and a cookie policy compatible with the two public origins.

This is the main Sprint 7B prerequisite for a functional Live Demo. Implement a platform-specific web authentication/API client rather than weakening native session handling or introducing a second authentication system.

For Safari compatibility, avoid treating the API as an unrelated third-party cookie domain. The preferred future topology is a web host and API host under a shared custom parent domain, with the final Better Auth cookie policy validated on Safari. Expo Hosting and an unrelated API subdomain are acceptable for a first technical test only after browser session persistence has been verified.

## MongoDB Atlas

MongoDB is already selected through `MONGO_URI`; there is no localhost dependency in the production code path.

Sprint 7B must verify, without committing credentials:

- Atlas Network Access for the selected host;
- least-privilege database user;
- production connection string stored only in host secrets;
- successful Mongoose and Better Auth MongoDB startup.

## Sprint 7C deployment verification

The first Render backend deployment is live at:

```text
https://mynews-api-3gx9.onrender.com
```

The public `GET /health` endpoint returns HTTP `200`. The protected `GET /api/v1/preferences` endpoint returns HTTP `401` when called without a session.

Native validation was performed on an iPhone with the local backend stopped and the device on 4G. Login and session handling, feed loading, pagination, favorite, Read / Unread, Saved, preference editing, logout/login, and session persistence after relaunch all worked against the public backend.

The Expo tunnel returned `ETIMEDOUT` during its first connection attempt, then the application loaded correctly. This was a transient tunnel condition and not a Render backend issue.

## TheNewsAPI

`THE_NEWS_API_KEY` remains backend-only. The provider URL and token remain isolated in `back-api/api/src/providers/thenewsapi.ts`; no production frontend configuration is needed. Sprint 7A made no provider call.

## Expo Web

`front-app/app.json` explicitly sets `expo.web.output` to `static`. This is the simplest fit for the current client-rendered Expo Router application and Expo Hosting: no Expo Router server rendering or API routes are needed.

Sprint 7A verified that:

```bash
npx expo export --platform web
```

successfully creates `front-app/dist`. The directory is ignored by Git.

Export success does not prove runtime web authentication: the browser-specific session work described above remains required in Sprint 7B. `EXPO_PUBLIC_API_URL` is read at bundle time with no localhost fallback, so each preview/production export must receive the intended public HTTPS API URL.

## Expo Build / EAS

There is no `eas.json`, no `expo.extra.eas.projectId`, and no configured Expo project ID. No account or project has been connected in Sprint 7A.

Future build profiles should be considered only in Sprint 7E:

```text
development
preview
production
```

## Native builds

The current Expo scheme is `frontapp`. Neither `ios.bundleIdentifier` nor `android.package` is configured. They must be chosen intentionally before the first native build; Sprint 7A does not choose identifiers.

Native builds will use the same public HTTPS API as Expo Web through a build-specific `EXPO_PUBLIC_API_URL`.

## Production assets

Current branding assets are in `front-app/assets/branding/`. The configured iOS icon still points to `assets/images/icon.png`, not to `mynews-app-icon.png`.

- A final opaque iOS app icon is pending: `mynews-app-icon.png` contains transparency and is not production-ready.
- Dedicated Android adaptive production assets are pending; the current adaptive assets remain in use.
- Branded splash logo and web favicon are configured.

These asset decisions belong to Sprint 7E and are not changed by Sprint 7A.

## Portfolio integration

### Desktop

The portfolio case study will expose:

```text
Live Demo
GitHub
QR code
```

The Live Demo is the public Expo Web application. Until native store distribution is approved, the QR code targets the public mobile web URL.

### Mobile

The portfolio will expose:

```text
Try myNews
GitHub
```

### App Store and TestFlight

App Store / TestFlight distribution is deliberately deferred. This is a product and cost decision, not a technical limitation: Expo Web and a future native preview build are sufficient for the initial portfolio demonstration.

## Hosting comparison

| Platform | Fit for the current API | Conclusion |
| --- | --- | --- |
| Render | Conventional Node Web Service, HTTPS, logs, environment variables, GitHub and monorepo root directory support | **Recommended**: deploy Express almost unchanged after the small Sprint 7B production fixes |
| Railway | Supports isolated monorepos and conventional Node services | Alternative: straightforward, but the current free offering is credit/trial based, so cost predictability must be checked before choosing it |
| Vercel | Can run Express as a Vercel Function | Not preferred for this separate API: it changes the operating model to serverless/Fluid compute and requires validating Mongo connection lifecycle, function limits, cookies and the Express entrypoint |

## Deployment checklist

### Sprint 7B — backend readiness

- [x] Add and test an HTTP health endpoint.
- [x] Make Express bind explicitly to `0.0.0.0` and platform `PORT`.
- [x] Validate production-critical environment variables.
- [x] Add configurable CORS and Better Auth trusted-origin allowlists.
- [x] Add `NODE_ENV` to the backend example environment file.
- [x] Re-run backend checks.

### Sprint 7C — first public deployment

- [x] Create the Render Web Service manually from `back-api`.
- [x] Configure production environment variables in the Render dashboard, including `BETTER_AUTH_URL` with the public Render URL.
- [x] Verify Atlas access, `GET /health` (`200`), and unauthenticated `GET /api/v1/preferences` (`401`).
- [x] Validate the public backend on iPhone over 4G: login/session, feed, pagination, article state, Saved, preferences, logout/login, and relaunch persistence.
- [ ] Export/deploy Expo Web with the public HTTPS API URL.
- [ ] Add exact deployed web origin to CORS and Better Auth.
- [ ] Test registration, login, reload/session restoration, feed, favorites, preferences and logout in a browser.
- [ ] Add portfolio Live Demo, GitHub and QR links after validation.

### Sprint 7E — native delivery preparation

- [ ] Choose iOS and Android identifiers.
- [ ] Finalize opaque iOS and Android adaptive assets.
- [ ] Connect an Expo project and define future EAS profiles if native builds are approved.

## Known limitations

- The public Render backend is deployed; Expo Web, a custom domain, an Expo project, EAS configuration, and native builds remain pending.
- Current browser authentication is not production-ready because it reuses native Secure Store/cookie forwarding assumptions.
- Native identifiers and production app icons are pending.

## Future App Store / TestFlight

Native App Store/TestFlight distribution remains an optional later step. It requires the deliberate identifier, asset, EAS profile and Apple Developer Program decisions recorded above; it is not required for the initial portfolio release.

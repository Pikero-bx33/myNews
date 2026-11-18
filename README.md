# myNews

myNews is a mobile-first personalized news application. Users choose their interests, content languages and optional keywords, then receive recent articles tailored to those preferences.

## Features

- Email/password authentication with Better Auth
- Preference onboarding for languages, topics and keywords
- Recent personalized news, restricted to the last seven days
- Manual Load More pagination, Favorite and Read / Unread states
- Saved articles, preference editing and persistent sessions
- Clean responsive React Native interface for iOS and Android

## Tech Stack

**Mobile:** React Native, Expo SDK 58, Expo Router, TypeScript, Redux Toolkit, Better Auth Expo, Expo Secure Store and Expo Image.

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, Zod, Better Auth and TheNewsAPI.

## Architecture

```text
React Native / Expo
        ↓
Express REST API
   ↓             ↓
MongoDB      TheNewsAPI
```

Better Auth owns authentication and sessions. MongoDB is the durable source of business state. Redux stores only the shared in-memory `ArticleUserState` map. TheNewsAPI remains isolated behind the backend provider layer.

## Project Structure

```text
front-app/  Expo mobile application
back-api/   Express API
docs/       Product, architecture and technical references
```

## Local Setup

```bash
cd back-api && yarn
cd ../front-app && yarn
```

Create local `.env` files from the matching `.env.example` files. On a physical iPhone, `EXPO_PUBLIC_API_URL` must point to an address reachable from the device, for example `http://<local-machine-ip>:3001`.

## Environment Variables

Backend: `PORT`, `MONGO_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `THE_NEWS_API_KEY`.

Frontend: `EXPO_PUBLIC_API_URL`.

Do not commit real values.

## Running the Backend

```bash
cd back-api
yarn dev
```

## Running the Frontend

```bash
cd front-app
npx expo start
```

## Main User Flow

```text
Register or Login
→ choose preferences when needed
→ recent personalized feed
→ Load More / open / save / mark read
→ edit preferences or logout
```

Returning users with saved preferences go directly to Home.

## API Overview

- `GET` / `PUT /api/v1/preferences`
- `GET /api/v1/feed?page=n`
- `GET` / `PUT /api/v1/articles/:articleId/state`
- `GET /api/v1/favorites`

All business routes derive the user from the Better Auth session.

## Data Model

`authUsers` is managed by Better Auth. myNews persists `userPreferences`, shared `articles`, and per-user `userArticleStates`. See [docs/DATA_MODEL.md](docs/DATA_MODEL.md).

## Design & Branding

The interface uses a light editorial system with Inter and the myNews brand assets. The product interaction color remains blue. The supplied iOS app icon still has transparency and must be replaced by an opaque production asset before a native release.

## MVP Limitations

- TheNewsAPI quota depends on the selected plan; each provider page currently contains at most three articles.
- Load More is manual; there is no search, notification, social feature, AI ranking or provider fallback.
- The feed is restricted to the last seven days and ordered by most recent publication.
- Production deployment and final native iOS/Android icon assets remain future work.

## Roadmap

The next production-focused work covers native assets, deployment and release preparation. Product extensions such as search, notifications, ranking and social features remain post-MVP.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the audited deployment architecture and the production-readiness work planned before any public deployment.

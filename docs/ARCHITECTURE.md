# Architecture

## 1. Overview

This project is a personalized mobile news aggregator.

The goal is to allow users to centralize news related to their interests instead of visiting multiple websites or applications.

Users create an account, select their interests, define custom keywords, choose their preferred content languages and receive a personalized feed containing recent and relevant news articles.

The first version of the application targets French-speaking users.

The application interface will initially be in French, while users may choose to receive news content in:

* French
* English
* French and English

The application is built around three main technical layers:

1. React Native mobile application
2. Express backend API
3. MongoDB database

External news data is retrieved by the backend from a third-party news provider.

---

## 2. High-Level Architecture

```text
┌──────────────────────────────┐
│                              │
│   React Native Mobile App    │
│   Expo + TypeScript          │
│                              │
└──────────────┬───────────────┘
               │
               │ HTTPS / JSON
               ▼
┌──────────────────────────────┐
│                              │
│   Express Backend API        │
│   Node.js + TypeScript       │
│                              │
│   Authentication             │
│   Preferences                │
│   Topics                     │
│   Feed                       │
│   Articles                   │
│                              │
└───────────┬──────────┬───────┘
            │          │
            │          │
            ▼          ▼
┌────────────────┐  ┌──────────────────┐
│                │  │                  │
│ MongoDB Atlas  │  │ External News    │
│                │  │ API              │
│                │  │                  │
└────────────────┘  └──────────────────┘
```

The mobile application must never communicate directly with the external news provider.

All external news requests go through the Express backend.

This protects API keys and prevents the mobile application from depending directly on a third-party API response format.

---

## 3. Technology Stack

### Mobile

* React Native
* Expo
* Expo Router
* TypeScript

Main responsibilities:

* user interface
* navigation
* authentication state
* onboarding
* preference management
* personalized feed rendering
* favorites
* read status
* article sharing
* profile and settings

### Backend

* Node.js
* Express
* TypeScript
* Zod
* Better Auth

Main responsibilities:

* authentication
* authorization
* API endpoints
* input validation
* business logic
* user preferences
* topic management
* external news provider communication
* article normalization
* feed generation
* database access

### Database

* MongoDB Atlas
* Mongoose

Main responsibilities:

* user-related application data
* user preferences
* topics
* normalized articles
* article caching when required
* favorites and read states

### Design

* Figma

Figma is used before and during development to define:

* screen layouts
* navigation flows
* reusable components
* typography
* colors
* spacing
* visual hierarchy
* responsive behavior

---

## 4. Authentication

Authentication is handled with Better Auth.

The MVP should support:

* email/password registration
* email/password login
* persistent authentication sessions
* logout

Conceptual flow:

```text
Mobile App
    │
    │ credentials
    ▼
Express / Better Auth
    │
    ▼
MongoDB
    │
    │ session
    ▼
Mobile App
```

Authentication concerns should remain separate from application-specific profile and preference concerns.

Better Auth-managed data should not be duplicated unnecessarily inside application-specific collections.

The authenticated user identifier will be used to associate application data such as preferences and article states with the correct user.

---

## 5. User Onboarding

After creating an account for the first time, the user completes an onboarding flow.

The onboarding collects the information required to personalize the news feed.

Conceptual flow:

```text
Create account
      ↓
Choose content languages
      ↓
Choose topics
      ↓
Add optional keywords
      ↓
Save preferences
      ↓
Open personalized feed
```

Example content language selection:

```text
Content languages

[x] Français
[x] English
```

Example topic selection:

```text
Interests

[x] Science
[x] Technology
[x] Sport
[ ] Cinema
[ ] Politics
[ ] Business
[ ] Food
```

Optional custom keywords:

```text
React Native
Formula 1
SpaceX
OpenAI
```

Preferences are persisted in MongoDB.

The onboarding should be completed only once initially, but the same preferences remain editable later from the application settings.

---

## 6. User Preferences Domain

User preferences are one of the central domains of the application.

They determine which articles should appear in the personalized feed.

A conceptual model:

```ts
UserPreferences {
  userId
  topics
  keywords
  contentLanguages
  preferredSources
  blockedSources
  createdAt
  updatedAt
}
```

Example:

```json
{
  "userId": "...",
  "topics": [
    "science",
    "technology",
    "sport"
  ],
  "keywords": [
    "React Native",
    "Formula 1",
    "SpaceX"
  ],
  "contentLanguages": [
    "fr",
    "en"
  ],
  "preferredSources": [],
  "blockedSources": []
}
```

Users must be able to update their preferences at any time.

Possible API endpoints:

```text
GET   /api/preferences
PATCH /api/preferences
```

After a preference update, subsequent feed requests must use the new preferences.

One user should normally have one preferences document.

---

## 7. Topics

Topics represent broad predefined interests offered by the application.

Examples:

```text
sport
technology
science
politics
business
cinema
culture
food
health
```

Topics are different from custom keywords.

Example:

```text
Topic
------
technology

Keywords
--------
React Native
OpenAI
Apple
SpaceX
```

A topic represents a broad category.

A keyword allows the user to personalize the feed more precisely.

A conceptual topic model:

```ts
Topic {
  slug
  labels
  icon
  isActive
}
```

Example:

```json
{
  "slug": "technology",
  "labels": {
    "fr": "Technologie",
    "en": "Technology"
  },
  "icon": "laptop",
  "isActive": true
}
```

The topic list should support localization.

The final available topics may evolve depending on the capabilities of the selected news provider.

Topics should be stored independently from users.

User preference documents should reference topic identifiers or slugs rather than duplicate the entire topic definition.

---

## 8. News Provider Architecture

The initial news provider has not yet been selected.

Only one provider should be used for the MVP.

The provider will be selected based on factors such as:

* French news coverage
* English news coverage
* topic/category support
* keyword search
* source filtering
* rate limits
* pricing
* licensing restrictions
* API reliability

Provider-specific code should remain isolated from the rest of the application.

Conceptually:

```text
                 ┌──────────────────┐
                 │ Feed Service     │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ News Provider    │
                 │ Layer            │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Provider #1      │
                 │                  │
                 └──────────────────┘
```

A future architecture could support:

```text
                News Provider Layer
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        Provider A              Provider B
```

Multiple providers should not be implemented until there is a real product or technical need.

---

## 9. Article Normalization

Different news APIs return different data structures.

The backend should convert provider-specific article responses into one internal application format.

Conceptual normalized model:

```ts
NormalizedArticle {
  externalId
  provider
  title
  description
  articleUrl
  imageUrl
  sourceName
  sourceDomain
  publishedAt
  language
  topics
}
```

Conceptual flow:

```text
External News API
       ↓
Provider-specific response
       ↓
Validation / parsing
       ↓
Normalization
       ↓
NormalizedArticle
       ↓
Feed service
       ↓
Mobile application
```

The mobile application should only know the normalized article model.

It should not know whether the external provider is GNews, NewsAPI, TheNewsAPI or another service.

This separation makes it easier to replace the provider later.

---

## 10. Personalized Feed

The personalized feed is generated from the preferences stored for the authenticated user.

Conceptual flow:

```text
User
 │
 ▼
GET /api/feed
 │
 ▼
Load UserPreferences
 │
 ├── topics
 ├── keywords
 ├── contentLanguages
 └── source preferences
 │
 ▼
Feed Service
 │
 ▼
News Provider
 │
 ▼
Normalize articles
 │
 ▼
Filter / rank
 │
 ▼
Return personalized feed
 │
 ▼
React Native App
```

The first MVP feed-ranking logic should remain simple.

Potential ranking signals:

* topic match
* keyword match
* preferred content language
* publication date
* preferred source
* blocked source

A future simple score could conceptually use rules such as:

```text
+ topic match
+ keyword match
+ preferred source
+ language match
+ freshness
- blocked source
```

Advanced recommendation algorithms are intentionally excluded from the MVP.

---

## 11. Article Persistence

External articles may be persisted in MongoDB when persistence is useful for:

* caching
* favorites
* read history
* article deduplication
* reducing unnecessary external API requests

Conceptual article model:

```ts
Article {
  provider
  externalId
  canonicalUrl
  title
  description
  imageUrl
  sourceName
  sourceDomain
  language
  publishedAt
  fetchedAt
  topics
}
```

Articles are shared application resources.

The application should not duplicate the complete article inside every user's data.

The application should avoid storing full copyrighted article content unless the selected news provider and its licensing terms explicitly allow it.

For the MVP, storing article metadata and linking users to the original article source is preferred.

---

## 12. User / Article Relationship

User-specific article states should be stored separately from shared article documents.

Conceptual model:

```ts
UserArticleState {
  userId
  articleId
  isFavorite
  isRead
  isHidden
  savedAt
  readAt
  createdAt
  updatedAt
}
```

Examples of user-specific state:

* article saved as favorite
* article already read
* article hidden from the feed

A user/article pair should be unique.

Conceptually:

```text
User A ──────┐
             │
             ▼
      UserArticleState
             │
             ▼
          Article
             ▲
             │
      UserArticleState
             ▲
             │
User B ──────┘
```

This prevents article duplication.

---

## 13. Favorites

Favorites are stored through the user/article relationship.

Conceptual flow:

```text
Article Card
     ↓
Tap Favorite
     ↓
Backend API
     ↓
UserArticleState
     ↓
MongoDB
```

Possible API operations:

```text
POST   /api/articles/:articleId/favorite
DELETE /api/articles/:articleId/favorite
```

The final endpoint structure will be decided when the feature is implemented.

Removing an article from favorites should update or remove the corresponding user/article state.

---

## 14. Read Status

Users should be able to mark articles as read.

The application may set an article as read when:

* the user opens the article detail
* the user explicitly marks it as read

Read state belongs to the user/article relationship.

Example:

```ts
{
  userId: "...",
  articleId: "...",
  isRead: true,
  readAt: "..."
}
```

This information may later be useful for:

* feed personalization
* reading history
* avoiding repeated content

Advanced behavioral recommendations are outside the MVP scope.

---

## 15. Article Sharing

Article sharing should use native React Native / Expo sharing capabilities.

The shared content should primarily contain:

* article title
* original article URL

Conceptual flow:

```text
Article
   ↓
Share button
   ↓
Native mobile share sheet
   ↓
Messages / Email / WhatsApp / etc.
```

No backend persistence is required for sharing in the MVP.

Sharing analytics could be added later if required.

---

## 16. Internationalization

Two separate language concepts exist in the application.

### UI Language

The language used by the application interface.

Initial value:

```text
fr
```

Future supported values may include:

```text
fr
en
```

### Content Languages

The languages of news articles requested by the user.

Supported initial options:

```text
fr
en
fr + en
```

These concepts must remain independent.

Example:

```text
UI language:
French

News content:
French + English
```

A French-speaking user may therefore use the application entirely in French while consuming both French and English articles.

User-facing strings should not be unnecessarily hardcoded in components if they are likely to require future localization.

---

## 17. Initial Database Model

Conceptually, MongoDB should contain the following application data:

```text
MongoDB
│
├── Better Auth collections
│
├── userPreferences
│
├── topics
│
├── articles
│
└── userArticleStates
```

### Better Auth collections

Managed primarily by Better Auth.

Responsibilities may include:

* authentication users
* sessions
* accounts
* verification-related data

Exact collections depend on Better Auth configuration.

### userPreferences

Stores personalization settings for each user.

Conceptual fields:

```text
userId
topics
keywords
contentLanguages
preferredSources
blockedSources
createdAt
updatedAt
```

### topics

Stores the available high-level application topics.

Conceptual fields:

```text
slug
labels.fr
labels.en
icon
isActive
```

### articles

Stores normalized article metadata when persistence is required.

Conceptual fields:

```text
provider
externalId
canonicalUrl
title
description
imageUrl
sourceName
sourceDomain
language
publishedAt
fetchedAt
topics
```

### userArticleStates

Stores the relationship between users and articles.

Conceptual fields:

```text
userId
articleId
isFavorite
isRead
isHidden
savedAt
readAt
createdAt
updatedAt
```

Exact Mongoose schemas should be designed when each corresponding domain is implemented.

Avoid creating complex schemas prematurely.

---

## 18. Initial Backend Domains

The backend should use a feature/domain-oriented architecture.

Potential structure:

```text
src/
│
├── auth/
│
├── users/
│
├── preferences/
│
├── topics/
│
├── articles/
│
├── feed/
│
├── providers/
│
├── config/
│
├── middleware/
│
└── app.ts
```

Responsibilities:

### auth

Authentication-related integration with Better Auth.

### users

Application-specific user logic if required.

### preferences

User interests, keywords and languages.

### topics

Available topics and topic retrieval.

### articles

Normalized article persistence and retrieval.

### feed

Personalized feed generation.

### providers

External news provider integrations and normalization.

### config

Environment variables and application configuration.

### middleware

Reusable Express middleware.

This structure represents the intended direction.

Folders should be introduced when the associated features are implemented rather than generating every folder before it is needed.

---

## 19. Mobile Navigation

Conceptual navigation structure:

```text
App
│
├── Auth
│   ├── Login
│   └── Register
│
├── Onboarding
│   ├── Languages
│   ├── Topics
│   └── Keywords
│
└── Main App
    │
    ├── Feed
    ├── Favorites
    └── Profile
        │
        └── Preferences
```

Expo Router will manage navigation.

Possible route groups could eventually resemble:

```text
app/
│
├── (auth)/
│
├── (onboarding)/
│
└── (tabs)/
```

The exact route structure should be determined during implementation.

Navigation should reflect authentication and onboarding state.

Conceptually:

```text
Not authenticated
      ↓
Auth

Authenticated
but onboarding incomplete
      ↓
Onboarding

Authenticated
and onboarding complete
      ↓
Main App
```

---

## 20. Security Principles

The application should follow these principles:

* External news API keys must remain on the backend.
* Secrets must be stored in environment variables.
* `.env` files must never be committed.
* Incoming API payloads should be validated with Zod.
* External API data should not automatically be trusted.
* Private endpoints require authentication.
* Users must only access or modify their own private data.
* Users must only modify their own preferences.
* Users must only modify their own article states.
* Authentication secrets must never be exposed to the mobile application.
* Avoid returning unnecessary database fields through API responses.
* Avoid using `any` where proper TypeScript types can be defined.

Security decisions should remain proportional to the learning/MVP scope without ignoring fundamental protections.

---

## 21. Architecture Decisions Log

Important architecture decisions should be recorded here as the project evolves.

The objective is to document not only what was chosen, but why.

---

### ADR-001 — Mobile Framework

**Decision**

Use React Native with Expo.

**Reason**

Expo simplifies cross-platform mobile development while allowing the developer to reinforce existing React knowledge.

It also provides useful mobile capabilities and works naturally with Expo Router.

---

### ADR-002 — Navigation

**Decision**

Use Expo Router.

**Reason**

Expo Router provides file-based navigation and integrates naturally with Expo projects.

It should simplify the separation between authentication, onboarding and main application routes.

---

### ADR-003 — Backend

**Decision**

Use a separate Express API written in TypeScript.

**Reason**

This keeps a clear separation between:

* mobile UI
* business logic
* authentication
* database
* external APIs

It also reinforces the existing MERN learning path.

---

### ADR-004 — Database

**Decision**

Use MongoDB Atlas with Mongoose.

**Reason**

MongoDB fits the MERN stack used during the developer's training.

Mongoose provides schema modeling and validation support while remaining familiar within the Node.js ecosystem.

---

### ADR-005 — Validation

**Decision**

Use Zod for application-boundary validation.

**Reason**

Zod provides explicit runtime validation and works well with TypeScript.

It will mainly validate:

* incoming API payloads
* user preference updates
* external API data when appropriate

---

### ADR-006 — Authentication

**Decision**

Use Better Auth.

**Reason**

Better Auth supports modern authentication flows while keeping authentication concerns separate from application business data.

The MVP should initially support:

* email/password

---

### ADR-007 — Preferences Persistence

**Decision**

User preferences are persisted server-side in MongoDB.

**Reason**

Preferences are core application data and must remain available:

* across sessions
* after application restarts
* potentially across multiple devices

They must not exist only inside React Native local state.

---

### ADR-008 — Topics and Keywords Separation

**Decision**

Predefined topics and user-defined keywords are modeled as separate concepts.

**Reason**

Topics represent broad application categories such as:

```text
technology
sport
science
```

Keywords provide more precise personalization such as:

```text
React Native
Formula 1
SpaceX
```

Keeping them separate improves data clarity and future feed-generation logic.

---

### ADR-009 — Topic Collection

**Decision**

Available application topics should be represented independently from user preferences.

**Reason**

This allows topics to evolve without duplicating topic metadata inside every user document.

It also supports:

* localized topic labels
* icons
* activation/deactivation
* future topic management

---

### ADR-010 — News API Access

**Decision**

External news providers are accessed only through the backend.

**Reason**

This:

* protects API credentials
* centralizes provider logic
* enables normalization
* simplifies the mobile application
* allows future provider replacement

---

### ADR-011 — News Provider Strategy

**Decision**

Use one news provider for the MVP.

**Reason**

Using multiple news APIs immediately would add unnecessary complexity.

The provider integration should remain isolated so another provider can be introduced later if justified.

The initial provider has not yet been selected.

---

### ADR-012 — Article Normalization

**Decision**

External articles are converted into one internal normalized article structure.

**Reason**

External providers use different response formats.

Normalization prevents the mobile application and feed logic from depending on a specific provider.

---

### ADR-013 — Article Persistence

**Decision**

Persist normalized article metadata only when persistence provides value.

**Reason**

Potential use cases include:

* favorites
* read history
* caching
* deduplication

Avoid unnecessarily storing complete third-party article content.

---

### ADR-014 — User Article State

**Decision**

Store user-specific article state separately from shared article documents.

**Reason**

Attributes such as:

* favorite
* read
* hidden

belong to the relationship between one user and one article.

This avoids duplicating complete articles for every user.

---

### ADR-015 — Internationalization

**Decision**

Keep UI language and content language as separate concepts.

**Reason**

A user may want:

```text
French interface
+
French and English news
```

The architecture must support this distinction from the beginning.

---

## 22. Future Architecture

Potential post-MVP evolutions include:

* multiple news providers
* push notifications
* daily personalized digest
* AI-generated article summaries
* advanced personalization
* behavioral recommendations
* preferred news sources
* blocked news sources
* search
* offline reading
* analytics
* admin tools
* social features
* comments
* article ratings
* Google authentication

These features must not increase MVP complexity unless explicitly required.

---

## 23. Architecture Evolution Principle

This document represents the intended architecture, not a requirement to implement everything immediately.

The project should evolve incrementally.

For each sprint:

1. implement only what is currently required
2. keep the architecture compatible with planned evolution
3. avoid premature abstraction
4. document meaningful architectural changes
5. update this file when an architectural decision changes

The objective is to maintain a codebase that is simple enough for learning while remaining structured enough to demonstrate professional development practices.

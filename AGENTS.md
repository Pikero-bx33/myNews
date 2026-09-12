# AGENTS.md

# Project Instructions

## 1. Project overview

This project is a personalized mobile news aggregator.

The goal is to allow users to centralize news related to their interests
instead of visiting multiple websites or applications.

Users define their interests, preferred topics, keywords, languages and,
later, potentially preferred or blocked news sources.

The application then provides a personalized feed containing recent articles
relevant to those preferences.

The first version targets French-speaking users.

The UI will initially be in French, but the architecture must support
internationalization later.

Users must be able to choose news content in:
- French
- English
- French + English


## 2. Learning objective

This is both a learning project and a portfolio project.

The developer recently completed a 6-month JavaScript full-stack bootcamp
and currently has a junior developer level.

The project should help reinforce:
- React Native
- Expo
- TypeScript
- Node.js
- Express
- MongoDB / Mongoose
- API integration
- authentication
- data modeling
- validation
- mobile application architecture
- testing
- Git workflow

When implementing features:

- Prefer simple and explicit solutions.
- Avoid unnecessary abstractions.
- Avoid over-engineering.
- Keep the code understandable for a junior developer.
- Explain important architecture decisions before implementing them.
- Work incrementally.
- Do not rewrite large parts of the project unless necessary.
- Prefer readable code over clever code.
- Introduce advanced patterns only when they solve a real problem.


## 3. Tech stack

### Mobile

- React Native
- Expo
- Expo Router
- TypeScript

### Backend

- Node.js
- Express
- TypeScript

### Database

- MongoDB Atlas
- Mongoose

### Validation

- Zod

### Authentication

- Better Auth

### Design

- Figma


## 4. MVP scope

The MVP should include:

1. User registration
2. Login with email/password
3. Google authentication
4. Persistent authentication session
5. First-login onboarding
6. Selection of user interests/topics
7. Optional custom keywords
8. Selection of preferred content languages
9. Personalized news feed
10. Article details
11. Save/remove article from favorites
12. Mark article as read
13. Share article using native mobile sharing
14. User profile/settings
15. Ability to update user preferences at any time

Users must be able to:
- add topics
- remove topics
- add custom keywords
- remove custom keywords
- change preferred content languages

Changes to preferences must affect the personalized feed.


## 5. Out of scope for the MVP

Do NOT implement these features unless explicitly requested:

- article comments
- user ratings
- social feeds
- community features
- advanced recommendation algorithms
- machine learning recommendations
- AI article summaries
- complex notification systems
- admin dashboard
- multiple news providers

These features may be considered later.


## 6. User preferences

User preferences are a core domain of the application.

Preferences must be persisted in MongoDB.

They should not exist only in the mobile application state.

The initial preference model should support:

- topics
- custom keywords
- content languages
- preferred sources (future-ready)
- blocked sources (future-ready)

Users must be able to modify their preferences at any time.

The personalized feed must use the stored preferences.


## 7. Topics

The application provides predefined high-level topics such as:

- sport
- technology
- science
- politics
- business
- cinema
- culture
- food
- health

Topics and custom keywords are different concepts.

Example:

Topic:
technology

Custom keywords:
React Native
OpenAI
SpaceX

Do not mix these concepts in the data model.

The final list of topics may evolve depending on the capabilities of the
selected news provider.

Topic labels should support localization.

Example:

science:
- fr: Science
- en: Science


## 8. News provider

The initial news provider has not yet been selected.

Do NOT introduce a news API without explicit approval.

The provider will be selected after comparing available news APIs based on:

- French content coverage
- English content coverage
- available topics/categories
- keyword search
- source filtering
- API limits
- pricing
- licensing constraints
- reliability

The MVP will initially use ONE external news provider.

The architecture must make it possible to replace the provider or add
another provider later without rewriting the mobile application.

Important rules:

- The mobile application must never call the external news API directly.
- All external news requests must go through the Express backend.
- API keys must remain server-side.
- External API responses must be validated when appropriate.
- External article data must be normalized before being sent to the mobile app.
- The mobile application must not depend on the provider's response format.


## 9. Article normalization

The backend should expose a provider-independent article model.

A normalized article will conceptually contain information such as:

- externalId
- provider
- title
- description
- sourceName
- sourceUrl or domain when available
- articleUrl
- imageUrl
- publishedAt
- language
- category/topics when available

The exact TypeScript model should be defined when the news provider
integration is implemented.

Do not expose unnecessary raw provider data to the mobile application.


## 10. Database principles

The expected core application collections are conceptually:

- users / authentication data
- userPreferences
- topics
- articles
- userArticleStates

Better Auth may create and manage its own authentication-related collections.

Do not duplicate authentication data unnecessarily in application-specific
collections.

### userPreferences

Should associate preferences with a user and contain:

- userId
- topics
- keywords
- contentLanguages
- preferredSources
- blockedSources
- createdAt
- updatedAt

### topics

Should represent available application topics.

Potential fields:

- slug
- localized labels
- icon
- isActive

### articles

Should store normalized article information when persistence/cache is needed.

Avoid storing full copyrighted article content unless explicitly allowed by
the selected provider and licensing terms.

### userArticleStates

Should store the relationship between a user and an article.

Potential states:

- favorite
- read
- hidden

Do not duplicate an entire article inside each user's document.


## 11. Backend architecture

Prefer a feature/domain-based architecture.

Expected domains may include:

- auth
- users
- preferences
- topics
- articles
- feed

Controllers should remain thin.

Business logic should live in services.

External news APIs should be accessed through provider/service modules.

Database access should remain separated from HTTP concerns when practical.

Avoid creating unnecessary architecture layers before they are needed.


## 12. Validation and security

Use Zod to validate incoming API payloads.

Never trust data received from:
- the mobile application
- external APIs

Never expose:
- API keys
- secrets
- authentication secrets

Secrets must remain in environment variables.

Do not commit `.env` files.

Use TypeScript strict mode.

Avoid `any`.


## 13. Mobile architecture

Use Expo Router for navigation.

Keep screens focused on presentation and interaction.

Extract reusable UI components when appropriate.

Avoid putting complex business logic directly inside screen components.

Handle at least these UI states when relevant:

- loading
- success
- empty
- error

The mobile application should consume only the backend API and should not
contain external news API credentials.


## 14. Internationalization

The initial UI language is French.

However, architecture should anticipate a future English UI.

Do not confuse:

- UI language
- news content language

Example:

A user may use the application interface in French while requesting news
content in both French and English.

Avoid unnecessarily hardcoding user-facing strings when implementing
screens that will later require localization.


## 15. Code conventions

- Use TypeScript strict mode.
- Avoid `any`.
- Prefer descriptive variable and function names.
- Keep functions reasonably small.
- Keep components reasonably small.
- Prefer explicit types for important domain models.
- Use Zod at application boundaries.
- Avoid premature optimization.
- Avoid unnecessary dependencies.
- Do not introduce a new library without explaining why it is needed.
- Follow the existing project conventions before introducing new ones.


## 16. Working method

Before implementing a substantial feature:

1. Read this AGENTS.md file.
2. Inspect the existing code.
3. Understand the current architecture.
4. Explain briefly what needs to change.
5. Identify the files that will be created or modified.
6. Implement the smallest useful increment.
7. Run available linting, TypeScript checks and tests.
8. Report any errors or warnings.
9. Explain what was changed.
10. Suggest the next logical step.

Do not implement future roadmap features unless explicitly requested.

When several valid solutions exist, explain the main trade-off before
choosing one.

Do not silently make major architecture decisions.


## 17. Documentation

This project must be documented continuously.

Important technical decisions should be reflected in:

docs/ARCHITECTURE.md

Project progress should be recorded in:

docs/PROJECT_LOG.md

After completing a meaningful sprint or feature, update PROJECT_LOG.md with:

- sprint name
- goal
- features implemented
- technical decisions
- problems encountered
- solutions
- tests performed
- next steps

The README should eventually provide the public portfolio-level presentation
of the project.


## 18. Git

Prefer small, meaningful commits.

Do not commit automatically unless explicitly requested.

Before suggesting a commit:
- summarize the changes
- verify the relevant checks
- propose a concise commit message
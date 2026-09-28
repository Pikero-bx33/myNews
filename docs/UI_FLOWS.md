# UI Flows

## Onboarding preferences

```text
Authenticated user
→ GET /api/v1/preferences
├── preferences: null → Languages (at least one required)
│                        → Topics (at least one required)
│                        → Keywords (optional)
│                        → PUT /api/v1/preferences
│                        → Home
└── preferences exists → Home
```

The onboarding state is local to the onboarding route group. Protected API calls retrieve the Better Auth cookie with `authClient.getCookie()` and send it in the `Cookie` header. A saved preference document marks onboarding as complete for the current user.

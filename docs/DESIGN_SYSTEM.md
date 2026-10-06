# Design system

## Purpose and visual direction

myNews is a modern, trustworthy and editorial mobile product. The interface
should help people scan current information calmly: readable content first,
clear actions second, decoration last. The first implementation is light mode
only and mobile-first.

Avoid heavy gradients, elevated or bubble-like cards, strong shadows, dense
border treatments and social-network visual clutter. Prefer white surfaces on
a very light neutral background, restrained blue accents and generous
whitespace.

## Source of truth

The implementation tokens live in
`front-app/theme/tokens.ts`. New or redesigned screens must consume these
tokens rather than introducing local equivalents. Existing screens will be
migrated incrementally in later visual blocks; Sprint 5A deliberately does
not restyle them.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#F9FAFB` | Screen background |
| `surface` | `#FFFFFF` | Cards, sheets and controls |
| `primary` | `#2563EB` | Main action, selected state, active navigation icon |
| `primaryLight` | `#3B82F6` | Secondary blue emphasis when needed |
| `primarySoft` | `#DBEAFE` | Soft selected background and information emphasis |
| `textPrimary` | `#111827` | Titles and main body copy |
| `textSecondary` | `#6B7280` | Metadata and supporting copy |
| `textMuted` | `#9CA3AF` | Low-priority, non-interactive information |
| `iconDefault` | `#6B7280` | Inactive functional icons |
| `iconActive` | `#2563EB` | Active or selected functional icons |
| `border` | `#E5E7EB` | Delicate separators and control outlines |
| `success` | `#10B981` | Confirmed success only |
| `error` | `#EF4444` | Errors and destructive feedback only |

Blue communicates navigation and action; it must not be used as a general
background. Color is never the only indicator of an error, selected state or
read state.

## Typography

Inter is loaded once in the root layout using the existing Expo font packages:
Regular (400), Medium (500), SemiBold (600) and Bold (700). The root waits for
those files before rendering the application, avoiding a fallback-font flash.
Screen styles will adopt the corresponding `fontFamily` values progressively
during their dedicated visual migrations.

| Style | Size / line height | Weight | Typical use |
| --- | --- | --- | --- |
| `display` | 28 / 34 | 700 | Exceptional top-level editorial emphasis |
| `screenTitle` | 24 / 30 | 700 | Screen title |
| `sectionTitle` | 20 / 26 | 600 | Section heading |
| `cardTitle` | 18 / 24 | 600 | Article title |
| `body` | 16 / 24 | 400 | Main readable text |
| `bodySecondary` | 15 / 22 | 400 | Descriptions and metadata groups |
| `caption` | 12 / 16 | 500 | Source, date and compact labels |
| `button` | 16 / 20 | 600 | Action labels |

Use sentence case, concise labels and a readable line length. Article titles
may span multiple lines; do not reduce their size merely to force one line.

## Spacing and layout

The base spacing scale is `4, 8, 12, 16, 24, 32` (`xs` to `xxl`). Use it for
padding, gaps and vertical rhythm. The default horizontal screen padding is
`24`; compact groups can use `16`. Prefer vertical separation over visible
containers when grouping editorial content.

## Shape, elevation and borders

Use radii of `8`, `12` and `16` (`sm`, `md`, `lg`). Controls and chips normally
use `12`; article cards use `16` when a distinct surface is necessary. Use the
`pill` radius only for compact status or filter chips. Borders are thin and
subtle (`border`); shadows are normally unnecessary. A surface should earn its
border or elevation through interaction or meaningful grouping.

## Iconography

Use the existing `@expo/vector-icons` / Ionicons direction for product icons.
Icons are functional, familiar and paired with labels where an action could be
ambiguous. Default icons use `textSecondary`; selected navigation or primary
actions use `primary`. Preserve a practical minimum touch target of 44 × 44 pt
around icon-only actions.

## Shared UI patterns

These rules describe current component families and the next implementation
targets; Sprint 5A does not add an unused component library.

### Actions and buttons

- Primary action: solid `primary` surface, white `button` text, radius `md`.
- Secondary action: `surface` with a `border` outline and `textPrimary` label.
- Text action: no container, `primary` label, reserved for low-emphasis flows.
- Disabled controls reduce emphasis and remain readable; they are not the only
  way to communicate why an action is unavailable.

### Chips

The existing selectable chip is used for preference selection. Its inactive
state is a white surface with border; its selected state uses `primarySoft`, a
`primary` border or icon, and a text label that remains legible. Selection
must be understandable without color alone (checkmark, icon or explicit
state where relevant).

### Article cards

Article cards prioritize source/date, title, then optional description and
image. They remain clean editorial surfaces: no heavy shadow, no nested cards
and no decorative gradients.

### Read and Favorite states

Read and Favorite are independent states. An unread article keeps its normal
contrast and strong title with an inactive read check. A read article uses a
slightly softer title or metadata contrast and an active check; it must never
become difficult to read. A non-favorited article uses a bookmark outline; a
favorited article uses a filled bookmark in `primary`. The product vocabulary
remains “Favorite”, even when the control is represented by that bookmark.

### Feedback states

Loading uses a clear progress indicator and a stable layout. Empty states
state what is missing and offer one relevant next action when available. Error
states name the problem in plain French and offer retry where it is safe.
Success feedback uses `success` sparingly and never as the sole confirmation.
Pressed states use a subtle, momentary contrast change without shifting the
layout. Selected states use color plus a visible selection cue. Disabled states
remain readable and explain unavailable important actions in nearby text.

## Navigation

Bottom navigation is the primary authenticated navigation. The active tab uses
`primary`; inactive tabs use `textSecondary`; its surface is white with a
subtle top border. The root navigation theme is light and uses the shared
tokens so system navigation surfaces cannot conflict with app screens.

## Accessibility

- Maintain readable contrast for text, controls and selected states.
- Keep body text at 16 px by default and avoid encoding meaning by color only.
- Provide accessible labels for icon-only buttons.
- Preserve 44 × 44 pt touch targets for tap controls.
- Respect screen-reader order: context, content, then actions.
- Test text scaling and long French labels before considering a screen done.

## Brand assets

The current Expo icon, Android adaptive assets, splash image and favicon are
generic project assets. They are not the myNews visual identity and should be
replaced together after a logo direction is approved. The future mark should
be simple, editorial and legible at small sizes; avoid literal newspaper
illustrations and detailed imagery. Until then, no generated asset is added.

When assets are approved, update the icon, adaptive foreground/background and
monochrome files, splash artwork/background and web favicon in `app.json`,
then verify iOS, Android and web rendering.

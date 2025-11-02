# Design System Guide

## Brand Essence
- **Name**: QuickEstimate Builder
- **Attributes**: precise, proactive, trustworthy, empowering.
- **Tone**: professional yet approachable, with emphasis on clarity and speed.

## Color Palette
| Token | Hex | Usage |
| --- | --- | --- |
| `color.surface` | `#0F172A` | Dark background for dark mode headers |
| `color.surface-alt` | `#111827` | Dark mode panels |
| `color.background` | `#F8FAFC` | Default page background |
| `color.primary` | `#F97316` | Primary CTA, highlights (accessible on light backgrounds) |
| `color.primary-dark` | `#C2410C` | Pressed state for primary elements |
| `color.secondary` | `#14B8A6` | Analytics accents, success states |
| `color.info` | `#38BDF8` | Informational badges |
| `color.warning` | `#FACC15` | Alerts requiring attention |
| `color.danger` | `#EF4444` | Destructive actions |
| `color.neutral-100` to `color.neutral-900` | Tailwind Slate scale | Text hierarchy, borders |

All colors meet WCAG AA contrast with paired text; maintain 4.5:1 ratio minimum.

## Typography
- **Primary Typeface**: Inter (system fallback `"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`).
- **Scale** (mobile-first):
  - Display: 28px / 36px leading
  - Title: 22px / 30px leading
  - Heading: 18px / 26px leading
  - Body: 16px / 24px leading
  - Caption: 14px / 20px leading
- Use variable font weight (400, 500, 600) for emphasis; avoid more than two weights per screen.

## Spacing & Layout
- Base unit: 8px grid.
- Container max width: 720px for tablet, fluid full-width on phones with 16px gutters.
- Corner radius tokens: `radius.sm=8px`, `radius.md=16px`, `radius.lg=24px`.
- Shadows: soft layered `0 10px 30px -12px rgba(15, 23, 42, 0.35)` for floating cards.

## Components
### Navigation
- Bottom tab bar with 5 icons + labels, active indicator bar (4px height).
- Floating action button (FAB) anchored above tab bar for quick creation and command palette.

### Cards
- Content layout: header (title + status chip), body (metrics or actions), footer (timestamps, CTA).
- Support swipe gestures: left swipe reveals edit/delete; right swipe triggers quick actions (mark as reviewed).

### Forms
- Use segmented controls for switching cost types.
- Inline validation with icon + microcopy; error messages kept under 60 characters.
- Date & number inputs optimized for mobile keyboards using proper input modes.

### Tables & Hierarchies
- Render as collapsible sections with sticky section headers.
- Provide indentation guides and color-coded badges for categories.
- Implement quick-add row anchored at bottom when keyboard visible.

### Feedback & Notifications
- Toasts appear top-right (desktop) or bottom-center (mobile) with haptic feedback via `navigator.vibrate` fallback.
- Confirmation modals use primary color background for destructive actions.
- Skeleton loaders mimic final layout with shimmering animation (1200ms loop).

## Interactions & Motion
- Transition duration: 200ms ease-out for entrance, 150ms ease-in for exit.
- Use spring physics (damping 18, stiffness 220) for FAB and draggable panels.
- Provide tactile sound cues optionally toggled in settings.

## Accessibility
- Touch targets minimum 44px.
- Focus outlines consistent across themes (`outline: 2px solid color.secondary`).
- Support dynamic text scaling up to 200% without breaking layout.
- Provide descriptive aria-labels for icons; avoid color-only differentiation.

## Illustrations & Empty States
- Use simple line illustrations with accent color secondary.
- Empty state copy follows formula: `What is missing?` + `Why it matters?` + `Primary action`.

## Design Tokens Delivery
- Tokens stored in JSON (Style Dictionary) exported to Tailwind config and CSS variables.
- Example snippet:
```json
{
  "color": {
    "primary": { "value": "#F97316" },
    "secondary": { "value": "#14B8A6" }
  },
  "radius": {
    "md": { "value": "16px" }
  }
}
```
- Tokens versioned with semantic release; CI validates contrast ratios automatically.

## Prototyping Guidelines
- Figma file contains page flows: onboarding, estimate editing, agent configuration, reporting.
- Utilize interactive components for swipe gestures and command palette.
- Include accessibility annotations for VoiceOver order and focus traps.

## Testing & Validation
- Run usability tests on iPhone 15 Safari TestFlight builds.
- Leverage Maze for task completion analytics.
- Collect qualitative feedback with in-app survey triggered after generating third estimate.

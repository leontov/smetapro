# Onboarding Guide

This guide explains how to extend and operate the SmetaPro onboarding flow.

## Architecture

- **Stack**: React 18 + Vite + TailwindCSS.
- **State**: `App.tsx` owns onboarding state and steps.
- **Gestures**: `attachSwipeHandlers` in `src/utils/gesture.ts` adds left/right swipe navigation.
- **Accessibility**: VoiceOver hints via `VisuallyHidden`, descriptive `aria-label`s and `aria-live` announcements.
- **Localization**: i18next configuration in `src/i18n/config.ts` with `en`/`ru` namespaces.

## Adding a New Onboarding Step

1. Update the `steps` array in `src/pages/App.tsx` with a new object `{ id, title, body, cta? }`.
2. If the step needs custom UI, add a conditional block inside the component similar to the key or sample project sections.
3. Localize copy in `src/i18n/en.json` and `src/i18n/ru.json`.
4. Update Playwright flows if the step affects navigation order.

## Gestures & Safe Area

- Safe-area padding is provided by `.safe-area` utility defined in `src/styles/index.css`.
- Gesture thresholds can be tuned in `src/utils/gesture.ts`.
- To simulate iPhone 15, use Safari responsive mode or Playwright WebKit device profile.

## Skeletons and Animations

- Loading state is triggered by `isLoading` boolean (mocked delay: 1.6s).
- `Skeleton` component in `src/components/Skeleton.tsx` renders accessible placeholders.
- Animations handled by `framer-motion`. Respect `prefers-reduced-motion` hook.

## Accessibility Checklist

- All focusable elements use `focus-visible` styles.
- Navigation buttons include text labels and disabled states.
- Language selector announces intent through `sr-only` label.
- Test with VoiceOver (macOS/iOS) and ensure step order is linear.

## Localization Workflow

1. Add keys to JSON dictionaries.
2. Use `t('namespace.key')` inside components.
3. Run `npm run test:e2e` to confirm texts render for both locales via UI tests.

## Sample Project Data

- Sample projects are defined through translations to keep them localizable.
- Each button currently triggers placeholder actions; extend with router integration or modal if needed.

## Security Key Flow

- `handleGenerateKey` currently produces placeholder text. Replace with secure API integration when backend is ready.
- Clipboard copying uses the modern Clipboard API; consider fallback for legacy browsers.

## Next Steps

- Integrate analytics to track completion.
- Persist onboarding progress using localStorage or server state.
- Add user accounts and personalization when backend endpoints become available.

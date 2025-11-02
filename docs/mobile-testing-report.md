# iPhone 15 QA Report

_Date: 2024-05-22_

## Devices & Browsers

- iPhone 15 Pro (Safari 17) – simulated via Playwright WebKit profile.
- iPhone 15 Pro (Chrome 123) – simulated via Playwright Chromium with device metrics.

## Safe Area

- Verified top/bottom safe-area padding via `.safe-area` utility.
- Bottom navigation stays above home indicator (tested with 34px inset).
- Header respects notch inset on Safari and Chrome.

## Gestures

- Horizontal swipe threshold set to 60px.
- Swipe left → next step, swipe right → previous step.
- Gesture does not interfere with vertical scrolling (no preventDefault).
- Buttons remain accessible as alternative controls.

## Accessibility

- VoiceOver hints announced through `aria-live` region.
- Language selector reachable via rotor (has `sr-only` label).
- Focus outlines visible under high-contrast mode.

## Known Issues

- Clipboard API requires user gesture; automated tests stub this behaviour.
- Icons are placeholder squares; replace with production artwork before launch.

## Recommendations

- Capture real-device screenshots for marketing.
- Add Playwright snapshot assertions once UI stabilizes.

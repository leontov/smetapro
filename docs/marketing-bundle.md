# Marketing Bundle

## Assets

| Asset | Path | Usage |
| --- | --- | --- |
| App Icon 192px | `public/icons/icon-192.svg` | PWA manifest, Android homescreen |
| App Icon 512px | `public/icons/icon-512.svg` | PWA manifest, splash screen fallback |
| Manifest | `public/manifest.webmanifest` | Metadata for install prompts |

## Metadata Checklist

- **App name**: `SmetaPro`
- **Short name**: `SmetaPro`
- **Theme color**: `#4C6FFF`
- **Background color**: `#0F172A`
- **Description**: "Mobile-first onboarding for cost estimation teams"

## Installation Instructions

1. Open the deployed site on iPhone Safari.
2. Tap the share button → `Add to Home Screen`.
3. Confirm the title and install; icon uses the 192px asset.
4. For Android Chrome, open menu → `Install app`.

## Future Enhancements

- Generate adaptive icons for Android (foreground/background layers).
- Provide Apple touch icons (`apple-touch-icon.svg` export as PNG during release).
- Add splash screen images using `@capacitor/splash-screen` if building native shells.

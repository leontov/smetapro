# Deploy Guide

## Prerequisites

- Node.js 18+
- Vercel CLI (`npm i -g vercel`) or Netlify CLI (`npm i -g netlify-cli`)
- Lighthouse CI token (if posting to external dashboard)

## Build

```bash
npm run build
```

### Output

Vite outputs static assets into `dist/`. Upload this folder to any static host with HTTPS.

## Vercel

1. `vercel login`
2. `vercel init` (framework: Vite)
3. Set build command `npm run build` and output directory `dist`
4. Configure environment variables if needed in Vercel dashboard.
5. Enable [Edge caching](https://vercel.com/docs/integrations) or configure headers via `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=600, must-revalidate" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

## Netlify

1. `netlify login`
2. `netlify init`
3. Build command: `npm run build`; publish directory: `dist`
4. Configure `_headers` file for caching:

```
/*
  Cache-Control: public, max-age=600, must-revalidate
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## HTTPS

Both Vercel and Netlify issue automatic TLS certificates via Let's Encrypt.

## Continuous Lighthouse

1. Create `.lighthouserc.json` (already provided) or update targets.
2. Add GitHub Action / Netlify build plugin to run `npm run lighthouse` on deploy previews.

## Monitoring

- Enable Web Vitals (Vercel Analytics).
- Use Playwright traces for regression detection.

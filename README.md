# Seventh Street Garage

Astro 5 site for Seventh Street Garage, a towing, recovery and impound company serving Los Angeles and Orange County since 1978.

## Getting started

```bash
npm install
npm run dev
```

`npm run build` runs `astro check` then builds to `dist/`.

## Project structure

- `src/data/` — all content (services, 50 cities, FAQs, site config) as typed TypeScript. Source of truth.
- `src/styles/global.css` — the design system.
- `public/images/` — optimized WebP photos.
- `src/pages/` — home, services, service areas (50 city pages), about, contact, vehicle release, auction, FAQ, privacy, 404.
- `src/pages/robots.txt.ts`, `llms.txt.ts`, `llms-full.txt.ts` — machine-readable endpoints.
- `public/site.webmanifest` — PWA manifest.
- `scripts/fetch-reviews.ts` — pulls Google Places reviews into `public/data/reviews.json`.

## Google reviews

Reviews are fetched from the Google Places API (v1) and saved to `public/data/reviews.json`.

1. Copy `.env.example` to `.env` and fill in `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`.
2. Run `npm run reviews` locally.
3. For automatic daily updates, add both values as repository secrets (`GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`) and enable the `.github/workflows/reviews.yml` Action. It runs daily, commits `public/data/reviews.json` when it changes, and pushes.

The API key is only used server-side in the script and in the GitHub Action — it is never sent to the browser.

## Contact forms

The contact and private-property forms post `FormData` to the URL in `SITE.formEndpoint` (`src/data/site.ts`) with `Accept: application/json`.

- **Formspree:** paste your Formspree endpoint URL (e.g. `https://formspree.io/f/xxxxxxx`) into `SITE.formEndpoint`.
- **Netlify Functions:** deploy a serverless function and set `SITE.formEndpoint` to its path (e.g. `/.netlify/functions/contact`).

While `SITE.formEndpoint` is empty, the form shows: "Online requests are not connected yet. Please call dispatch at (310) 856-1980." No fake success messages are ever shown.

## Deploying

### Netlify

The included `netlify.toml` sets the build command (`npm run build`), publish directory (`dist`), and long-cache headers for `/images/*` and `/_astro/*`. Connect the repo in Netlify and deploy — no extra config needed.

### Vercel

Vercel auto-detects Astro. Import the repo and deploy. The build command (`npm run build`) and output directory (`dist`) are detected automatically. Add `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` as environment variables if you run the reviews script via Vercel's cron.

## Sitemap

The `@astrojs/sitemap` integration generates `sitemap-index.xml` at build time. The 404 page is filtered out via the `filter` option in `astro.config.mjs`.

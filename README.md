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
- `src/styles/admin.css` — admin panel styles.
- `public/images/` — optimized WebP photos.
- `src/pages/` — home, services, service areas (50 city pages), about, contact, vehicle release, auction, FAQ, privacy, 404, admin.
- `src/pages/robots.txt.ts`, `llms.txt.ts`, `llms-full.txt.ts` — machine-readable endpoints.
- `src/lib/supabase.ts` — Supabase client and shared types.
- `public/site.webmanifest` — PWA manifest.
- `scripts/fetch-reviews.ts` — pulls Google Places reviews into `public/data/reviews.json`.

## Google reviews

Reviews are fetched from the Google Places API (v1) and saved to `public/data/reviews.json`.

1. Copy `.env.example` to `.env` and fill in `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`.
2. Run `npm run reviews` locally.
3. For automatic daily updates, add both values as repository secrets (`GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`) and enable the `.github/workflows/reviews.yml` Action. It runs daily, commits `public/data/reviews.json` when it changes, and pushes.

The API key is only used server-side in the script and in the GitHub Action — it is never sent to the browser.

## Contact forms

The contact and private-property forms save submissions directly to the Supabase `inquiries` table. If `SITE.formEndpoint` is set in `src/data/site.ts`, the form posts to that URL instead (Formspree, Netlify Functions, etc.) and still saves to the database.

Submissions appear in the admin panel under **Inquiries**, where staff can view details, change status (new/read/replied), reply by email or phone, delete entries, and export all inquiries as CSV.

## Admin panel

The admin panel at `/admin` is gated behind Supabase email/password authentication. It is excluded from search engines via `noindex`.

### Modules

- **Inquiries** — contact form submissions with status tracking, CSV export, and quick reply links.
- **FAQs** — add, edit, delete, and reorder frequently asked questions by category (home, vehicle release, auction) with draft/published toggles.
- **Settings** — key-value store for site configuration, API keys, and notification settings.

### Email notifications

When a new inquiry is inserted into the database, a Postgres trigger fires an HTTP request to the `notify-inquiry` edge function, which sends a branded email alert via [Resend](https://resend.com).

To activate:

1. Sign in to the admin panel at `/admin`.
2. Go to **Settings** and find the **Email Notifications** card.
3. Enter the notification email address and a Resend API key.
4. Save — every new inquiry will trigger an email automatically.

The edge function reads both values from the `settings` table at runtime, so they can be changed without touching code.

### Database

Supabase provides the database, auth, and edge function hosting. The following tables are used:

| Table | Purpose |
| --- | --- |
| `inquiries` | Contact form submissions |
| `faqs` | FAQ content managed from admin |
| `settings` | Key-value config (notification email, API keys) |

Row-level security is enabled on all tables. Public visitors can only insert inquiries; all other operations require authentication.

Migrations are in `supabase/migrations/` and edge function source is in `supabase/functions/notify-inquiry/`.

## Deploying

### Netlify

The included `netlify.toml` sets the build command (`npm run build`), publish directory (`dist`), and long-cache headers for `/images/*` and `/_astro/*`. Connect the repo in Netlify and deploy — no extra config needed.

### Vercel

Vercel auto-detects Astro. Import the repo and deploy. The build command (`npm run build`) and output directory (`dist`) are detected automatically. Add `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` as environment variables if you run the reviews script via Vercel's cron.

## Sitemap

The `@astrojs/sitemap` integration generates `sitemap-index.xml` at build time. All routes are included automatically — new pages appear in the sitemap on the next build. The 404 page is filtered out via the `filter` option in `astro.config.mjs`.

## robots.txt

A dynamic route (`src/pages/robots.txt.ts`) generates `robots.txt` at build time. It allows all crawlers, blocks the `/data/` directory, explicitly allowlists major AI/search bots, and points to the sitemap index.

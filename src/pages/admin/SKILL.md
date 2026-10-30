---
name: admin-panel
description: Reusable admin panel specification for content-managed websites — authentication, tabbed navigation, CRUD modules (inquiries, blog, press releases, social posts, media library, analytics, settings), optional modules (user management, SEO settings, llms.txt settings), edge function integrations, and a framework for adding new modules per client. Use whenever the user asks to build, set up, or standardize an admin panel, dashboard, or content management backend — even if they don't mention "admin panel" by name. Works in Bolt, Claude, Cursor, or any AI IDE. Supports Supabase (default) and Oracle.
---

# Admin Panel Specification

A standardized, reusable admin panel for content-managed websites. Drop this file into any project and tell your AI assistant which modules you want and which database you use. The AI follows this spec to build a complete, production-ready admin panel that inherits the project's branding.

## How to use this spec

1. Place this file in your project (in Bolt: `.bolt/skills/admin-panel/SKILL.md`).
2. Tell your AI assistant: "Follow the admin panel spec and build these modules: [list]. Database: [Supabase | Oracle | other]."
3. The AI confirms the module list, then builds each module in order: database layer first, then the admin UI, then any edge functions.
4. To add features later, tell the AI: "Add [module name] to the admin panel following the spec."

### Quick-start checklist (the AI follows this)

- [ ] Confirm which modules are requested (core vs optional)
- [ ] Confirm the database (Supabase default, Oracle, or other)
- [ ] Create database tables + access-control policies for each module
- [ ] Create storage buckets if any module needs file uploads
- [ ] Build the admin page: auth gate, tabbed nav, shared UI conventions
- [ ] Build each requested module's list view, form, and CRUD functions
- [ ] Build edge functions for any integrations (analytics, AI image gen, etc.)
- [ ] Build the Settings tab with API key management
- [ ] Verify the build passes

---

## Core Architecture

Every admin panel built from this spec shares the same foundation. The modules are pluggable — add only what the client needs.

### Authentication

The admin panel is gated behind email/password authentication. Unauthenticated users see a login screen; authenticated users see the dashboard.

**Pattern:**
- On mount, check for an existing session. Show a spinner while checking.
- If no session, render a login form (email + password, show/hide toggle, error display).
- Support both login and signup modes via a tab toggle.
- On successful login, set an `authed` state and load all module data in parallel.
- On logout, clear the session and reset state.
- Subscribe to auth state changes so the panel reacts if the session expires.

**Supabase implementation:**
```typescript
supabase.auth.getSession().then(({ data: { session } }) => { /* set authed */ });
const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => { /* update authed */ });
// cleanup: sub.subscription.unsubscribe()
```

**Oracle / other databases:** Implement an equivalent auth endpoint (e.g., a REST API that issues a JWT). The UI pattern stays the same — the only change is the API call.

### Admin role check

Only users with an `admin` role should access the panel. In Supabase, use a `SECURITY DEFINER` function that reads `raw_app_meta_data` from `auth.users`:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT (raw_app_meta_data ->> 'role') = 'admin'
     FROM auth.users WHERE id = auth.uid()), false);
$$;
-- Revoke EXECUTE from anon and authenticated to prevent privilege escalation:
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;
```

This reads from the database, not the JWT, so role changes take effect even if the user's token was issued before the role was granted.

### Tabbed navigation

The admin panel uses a horizontal tab bar. Each tab has: a key, label, icon (from lucide-react), and an optional count badge showing the number of records in that module.

```typescript
const tabDefs = [
  { key: 'analytics', label: 'Analytics', count: null, icon: BarChart3 },
  { key: 'inquiries', label: 'Inquiries', count: inquiries.length, icon: MessageSquare },
  // ...
];
```

Tabs render as pill-shaped buttons. The active tab gets the primary color background; inactive tabs get a white card with a border. Count badges appear as small pills inside the tab.

### Shared UI conventions

Every content module follows the same interaction patterns so the admin experience is consistent:

**Inline editing:** Each row in a list has an "Edit" button. Clicking it expands an inline form below the row (animated with framer-motion `AnimatePresence`). The form replaces the row content while editing. Clicking "Edit" again or "Cancel" collapses it.

**Delete confirmation:** Delete buttons show a trash icon. Clicking once reveals inline "Confirm delete" and "Cancel" buttons. This prevents accidental deletes without a modal dialog.

**Save pattern:** Content modules with publishing use a dual-button footer:
- "Save as Draft" — saves with `published: false`, muted button style
- "Save & Publish" — saves with `published: true`, green button style
Both buttons are disabled if required fields are empty or while saving. A spinner replaces the icon during save.

**Publish toggle:** A toggle switch (lucide `ToggleLeft` / `ToggleRight`) with "Draft" / "Published" label. This is the in-form toggle; the save buttons are the actual action.

**Empty states:** Each module shows a centered icon (faded), a short message, and a call to action ("Create your first post above").

**Error banner:** A red-bordered banner appears at the top of the content area when a save or delete fails. It includes the error message and a dismiss button.

**Loading states:** A spinner (lucide `RefreshCw` with `animate-spin`) appears on the refresh button and in save buttons during operations.

**Form field styling:** All inputs use `border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[primary-color]`. Labels use `text-xs font-semibold text-slate-500`. Selects add `bg-white`.

### Data loading

On successful authentication, fetch all module data in parallel:

```typescript
const [inqRes, postRes, prRes, socRes] = await Promise.all([
  supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
  supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
  // ...
]);
```

A manual refresh button in the header re-runs this load. Each module also reloads after any mutation (save, delete).

### Visual theme

The admin panel inherits the project's Tailwind color tokens. Define primary and accent colors in `tailwind.config.js`:

```javascript
colors: {
  bc: {
    blue: '#1B3B8A',        // primary — buttons, active tabs, links
    'blue-dark': '#142D6B',  // hover state for primary buttons
    electric: '#0EA5E9',     // accent — focus rings, tag badges
  },
}
```

Each project defines its own color palette. The admin components reference these tokens (`bg-bc-blue`, `text-bc-electric`, etc.) so they automatically match the project's branding. When adapting to a new project, update the color tokens in the Tailwind config — the admin panel picks up the new colors without code changes.

The admin shell uses a light theme: `bg-slate-50` page background, `bg-white` cards with `border-slate-200`, `text-slate-900` headings. The login screen uses a dark theme: `bg-slate-900` with `bg-white/10` inputs.

---

## Core Module Catalog

These modules are included by default. Skip any the client does not need.

### 1. Inquiries

Manages contact form submissions from the public website.

**Type:**
```typescript
type Inquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  operation_type: string | null;
  message: string;
  created_at: string;
};
```

**UI:** Table view with columns: Date, Name, Company, Email, Type, Message (truncated). Inline edit form. CSV export button (generates a Blob and triggers download). Delete with confirmation.

**CSV export:** Build headers and rows, escape quotes and commas, create a Blob, and trigger a download link.

**Database (Supabase):**
```sql
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text,
  operation_type text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
-- Public can submit (INSERT to anon); only authenticated can read/update/delete
CREATE POLICY "insert_inquiry" ON inquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select_inquiry_auth" ON inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "update_inquiry_auth" ON inquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_inquiry_auth" ON inquiries FOR DELETE TO authenticated USING (true);
```

**Oracle adaptation:** Replace `uuid` with `RAW(16)` or `SYS_GUID()`, `text` with `VARCHAR2`, `timestamptz` with `TIMESTAMP WITH TIME ZONE`. Access control via database roles or application-level checks in the API layer.

### 2. Blog Posts

Full article CMS with image management.

**Type:**
```typescript
type BlogPost = {
  id: string;
  title: string;
  slug: string;
  tag: string | null;
  read_time: string | null;
  excerpt: string | null;
  body: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  keywords: string[] | null;
};

type BlogImage = {
  id: string;
  url: string;
  caption: string | null;
  position: number;
};
```

**UI:** List of posts with title, tag badge, published/draft badge, excerpt preview. Inline expand to edit. "New Post" button opens a form card above the list.

**Form fields:** Title (auto-generates slug on new posts), Slug (monospace), Tag (select), Read Time, Excerpt (textarea), Keywords (tag input — type and press Enter), Body (textarea, monospace).

**Image management (after first save):** Upload images to a per-post folder in the `blog-images` storage bucket. Images display as thumbnails with: hero badge on first image, reorder arrows, delete button, and inline caption input. The first image by position order is the hero/card thumbnail.

**Slug generation:** `text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`

**Database (Supabase):**
```sql
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  tag text DEFAULT 'General',
  read_time text DEFAULT '5 min read',
  excerpt text,
  body text,
  keywords text[] DEFAULT '{}',
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- Public reads published; authenticated reads all; authenticated writes
CREATE POLICY "select_published_posts" ON blog_posts FOR SELECT TO anon USING (published = true);
CREATE POLICY "select_all_posts_auth" ON blog_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_posts_auth" ON blog_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_posts_auth" ON blog_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_posts_auth" ON blog_posts FOR DELETE TO authenticated USING (true);

CREATE TABLE blog_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  position integer DEFAULT 0
);
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_blog_images_public" ON blog_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_blog_images_auth" ON blog_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_blog_images_auth" ON blog_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_blog_images_auth" ON blog_images FOR DELETE TO authenticated USING (true);
```

**Storage bucket:**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;
-- Write policies for authenticated only; public reads via bucket URL (no SELECT policy needed)
CREATE POLICY "blog_images_insert_admin" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());
CREATE POLICY "blog_images_update_admin" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin()) WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());
CREATE POLICY "blog_images_delete_admin" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin());
```

### 3. Press Releases

Manages press releases and media coverage announcements.

**Type:**
```typescript
type PressRelease = {
  id: string;
  headline: string;
  summary: string | null;
  type: string;
  release_date: string;
  pdf_url: string | null;
  published: boolean;
  created_at: string;
};
```

**UI:** List with headline, type badge, date, published/draft badge. Inline expand to edit. "New Release" button.

**Form fields:** Headline, Type (select: Press Release, Media Coverage, Award, Partnership), Date (date input), Summary (textarea), PDF URL (optional — monospace input for a path like `/news-and-pr/filename.pdf`).

**Database (Supabase):**
```sql
CREATE TABLE press_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  summary text,
  type text DEFAULT 'Press Release',
  release_date date NOT NULL DEFAULT CURRENT_DATE,
  pdf_url text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE press_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_published_pr" ON press_releases FOR SELECT TO anon USING (published = true);
CREATE POLICY "select_all_pr_auth" ON press_releases FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_pr_auth" ON press_releases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_pr_auth" ON press_releases FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_pr_auth" ON press_releases FOR DELETE TO authenticated USING (true);
```

### 4. Social Posts

Manages shareable social cards (events, company updates, milestones).

**Type:**
```typescript
type SocialPost = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  category: string | null;
  event_date: string;
  location: string | null;
  published: boolean;
  created_at: string;
};
```

**UI:** List with title, category badge, date, location, published/draft badge. Inline expand to edit. "New Social Post" button.

**Form fields:** Title, Category (select: Event, Company Update, Milestone, Award, Partnership, Community), Event Date, Location (optional), Body (textarea), Image URL (optional, monospace), Link URL (optional, monospace).

**Database (Supabase):**
```sql
CREATE TABLE social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  image_url text,
  link_url text,
  category text DEFAULT 'Company Update',
  event_date date DEFAULT CURRENT_DATE,
  location text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_published_social" ON social_posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "insert_social_admin" ON social_posts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "update_social_admin" ON social_posts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "delete_social_admin" ON social_posts FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX idx_social_posts_event_date ON social_posts(event_date DESC);
```

### 5. Media Library

Centralized image and video management with AI generation.

**Type:**
```typescript
type MediaItem = {
  id: string;
  url: string;
  storage_path: string;
  type: string;
  category: string | null;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
};
```

**UI:** Grid of media cards with image/video preview, category filter chips, search input, alt text inline edit, copy URL button, delete with confirmation. "Upload" button (multi-file) and "Generate with AI" button (opens prompt input).

**Upload:** Accept images (png, jpeg, webp, gif, svg) and videos (mp4, webm, ogg). Max 50 MB. Upload to `media` storage bucket at `images/` or `videos/` path. Insert metadata row in `media_items`.

**AI generation:** Calls the `generate-image` edge function with a prompt and category. The function uses the OpenAI API key from the settings table, generates a DALL-E 3 image, uploads it to the `media` bucket, and inserts a metadata row.

**Database (Supabase):**
```sql
CREATE TABLE media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text NOT NULL,
  type text NOT NULL,
  category text,
  alt_text text,
  caption text,
  width integer,
  height integer,
  file_size bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
-- Public can read (media is public content); authenticated manages
CREATE POLICY "public_read_media" ON media_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_insert_media" ON media_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_media" ON media_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_media" ON media_items FOR DELETE TO authenticated USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "public_read_media_bucket" ON storage.objects FOR SELECT TO public USING (bucket_id = 'media');
CREATE POLICY "auth_insert_media_bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "auth_update_media_bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');
CREATE POLICY "auth_delete_media_bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
```

### 6. Analytics

Google Analytics 4 dashboard showing website traffic metrics.

**UI:** Four metric cards (Active Users, Sessions, Avg Session Duration, Total Page Views) with sparkline charts. A horizontal bar chart for "New Users by Channel." A top-pages list. A daily-active-users sparkline. A "not connected" error state with setup instructions.

**Data source:** Calls the `ga-analytics` edge function, which signs a JWT with the Google service account private key and queries the GA4 Data API. Requires three secrets: `GA_PROPERTY_ID`, `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY`.

**Error state:** When analytics is not configured, show an amber info card with step-by-step setup instructions (enable GA4 Data API, create service account, add to GA property, set secrets in Supabase).

### 7. Settings

API key and integration management.

**UI:** A card per integration. Each card has: an icon, title, description, a password-style input with show/hide toggle, a "Save Key" button with saving/saved states, and a "Remove" button when a key exists. A status line shows whether the key is configured.

**Database (Supabase):**
```sql
CREATE TABLE settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
-- Authenticated only — settings contain secrets
CREATE POLICY "auth_read_settings" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_settings" ON settings FOR DELETE TO authenticated USING (true);
```

**Pattern for adding a new setting:** Add a new card in the Settings tab that reads/writes a new `key` row in the settings table (e.g., `openai_api_key`, `sendgrid_api_key`, `stripe_secret_key`).

---

## Optional Module Catalog

These modules are built only when explicitly requested.

### User Management

**Request trigger:** Client needs multiple admin users, role-based permissions, or an invite flow.

**Type:**
```typescript
type AdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  last_sign_in_at: string | null;
};
```

**UI:** Table of users with email, role badge, last sign-in date. Role select (admin / editor / viewer). Invite button (sends email with signup link). Deactivate/reactivate toggle.

**Implementation notes:**
- In Supabase, roles are stored in `raw_app_meta_data` as `{ role: 'admin' }`. Use the service role key in an edge function to update user metadata (the anon key cannot modify other users).
- RLS policies use `public.is_admin()` for admin-only operations and `public.is_editor()` for editor-level operations.
- Create a `SECURITY DEFINER` function `is_editor()` that returns true if role is `admin` or `editor`.

### SEO Settings

**Request trigger:** Client wants to manage per-page SEO metadata without touching code.

**Type:**
```typescript
type SEOMeta = {
  id: string;
  path: string;          // URL path, e.g. "/blog/my-post"
  title: string;
  description: string;
  og_image_url: string | null;
  canonical_url: string | null;
  robots_directive: string; // "index, follow" | "noindex, nofollow"
  updated_at: string;
};
```

**UI:** A table of pages with their SEO metadata. Inline edit form per row. A "Scan Site" button that crawls the app's routes and creates empty SEO rows for any missing pages.

**Integration:** The `useSEO` hook checks the database for a matching `path` and uses the stored values if available, falling back to the hardcoded defaults.

**Database (Supabase):**
```sql
CREATE TABLE seo_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  og_image_url text,
  canonical_url text,
  robots_directive text DEFAULT 'index, follow',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE seo_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_seo" ON seo_meta FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_insert_seo" ON seo_meta FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "auth_update_seo" ON seo_meta FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "auth_delete_seo" ON seo_meta FOR DELETE TO authenticated USING (public.is_admin());
```

### llms.txt Settings

**Request trigger:** Client wants AI search engines and LLMs to accurately understand and represent their site.

**Type:**
```typescript
type LLMsConfig = {
  site_name: string;
  site_url: string;
  summary: string;
  key_pages: { title: string; url: string; description: string }[];
  best_used_for: string[];
  content_type: string;
  scope: string;
  citation_guidance: string;
  updated_at: string;
};
```

**UI:** A form (not a table) with fields for each section of the llms.txt standard. The "Key Pages" section is a dynamic list (add/remove rows). A "Preview" panel shows the rendered llms.txt content. A "Save & Publish" button writes the rendered content to `public/llms.txt` (via an edge function or build script).

**llms.txt format:** Follows the [llms.txt standard](https://llmstxt.org/):
```
# {Site Name}

> {One-line description}

## Summary
**Site:** {url}
**Author / Company:** {name}
**Last updated:** {date}

{Full summary paragraph}

## Key Pages
- [{Title}]({url}) — {description}
...

## For AI & LLM Consumers
{What this site is, best used for, content type, scope, citation guidance}

## Attribution
Created by {name}. Free to use and share.
Source: {url}
```

**Database (Supabase):** Store as a single JSON row in the settings table with key `llms_txt_config`. An edge function or build script renders the markdown and writes it to `public/llms.txt`.

---

## Edge Function and Integration Patterns

Edge functions run server-side and handle operations that should not expose secrets to the browser.

### Required CORS headers

Every edge function must include these headers on every response (preflight, success, and error):

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
```

### Pattern 1: Read-only external API (GA Analytics)

The function reads secrets from environment variables, signs a JWT, calls an external API, and returns the data. No database writes.

**Key points:**
- Secrets come from `Deno.env.get()` (set in the Supabase dashboard under Edge Functions → Secrets).
- The client calls the function with the user's auth token in the `Authorization` header.
- The function does not validate the token itself — Supabase's gateway handles that when `verify_jwt` is true on the function.
- Return a 503 with a helpful message when secrets are not configured.

### Pattern 2: API key from settings table (AI Image Generation)

The function reads an API key from the `settings` table (falling back to an env var), calls an external API, processes the result, and writes to both storage and the database.

**Key points:**
- Use the service role key to create a Supabase client inside the function: `createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)`.
- Read the key: `supabase.from('settings').select('value').eq('key', 'openai_api_key').maybeSingle()`.
- Validate user input (prompt length, type) before calling the external API.
- Upload the result to storage and insert a metadata row in one flow.
- Return helpful error messages for each failure point.

### Pattern 3: Scheduled task (News Scanner)

A cron-triggered function that fetches data from external sources, processes it, and inserts into the database.

**Key points:**
- Use `npm:` imports for third-party packages (e.g., `npm:rss-parser@3.13.0`).
- Deduplicate results before inserting (e.g., by URL).
- Use `upsert` with `onConflict` and `ignoreDuplicates: true` to avoid duplicates.
- Schedule via Supabase's `pg_cron` extension in a migration.

### Adding a new integration

1. Add a settings card in the Settings tab for the API key (new `key` in the settings table).
2. Create an edge function following the appropriate pattern above.
3. Write the function to `supabase/functions/<function-name>/index.ts`.
4. Deploy via the Supabase MCP `deploy_edge_function` tool.
5. Add any needed secrets via the Supabase dashboard or MCP.
6. Add UI to call the function from the admin panel (fetch with the user's auth token).

---

## Database Layer

### Supabase (default)

- Use the `apply_migration` MCP tool for all DDL (CREATE TABLE, ALTER, RLS policies, indexes). Never raw SQL outside that tool.
- Every table gets RLS enabled: `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;`
- Write 4 separate policies (one per CRUD verb), never `FOR ALL`.
- Use `auth.uid()` for ownership checks. Use `public.is_admin()` for admin-only operations.
- Public content (blog posts, press releases, social posts) gets `SELECT TO anon USING (published = true)` for public reads and `SELECT TO authenticated USING (true)` for admin reads.
- Inquiries get `INSERT TO anon` (public form submissions) but `SELECT/UPDATE/DELETE TO authenticated` only.
- Settings and media management are `authenticated` only (except media public reads).
- Storage buckets: create as public for content that needs public URLs. Write policies for authenticated only. Do not add a broad `SELECT` policy on `storage.objects` for public buckets — public URLs work without it, and the broad policy leaks file listings.

### Oracle

- Replace `uuid` with `SYS_GUID()` or `RAW(16)`.
- Replace `text` with `VARCHAR2(n)` or `CLOB` for long text.
- Replace `text[]` with a junction table or `CLOB` storing JSON.
- Replace `timestamptz` with `TIMESTAMP WITH TIME ZONE`.
- Replace `boolean` with `NUMBER(1)` (0/1).
- Replace RLS with database roles, VPD policies, or application-level access checks in the API layer.
- Replace Supabase Storage with Oracle Cloud Object Storage or equivalent.
- Edge functions become REST API endpoints or serverless functions with the same logic.

### General rules for any database

- Each content module needs: a UUID primary key, `created_at` and `updated_at` timestamps, and a `published` boolean (for content modules).
- Access control separates public reads (published content) from admin writes (authenticated only).
- File uploads need a storage solution with public read URLs and authenticated write access.
- The admin UI code stays the same regardless of database — only the data-access layer changes.

---

## Extensibility Framework

### Adding a new content module

Follow these steps in order:

1. **Define the TypeScript type** — Add it near the other module types in the admin page. Include all fields the form will edit.

2. **Create the empty-state factory** — A function returning a `Partial<Type>` with sensible defaults:
```typescript
const emptyThing = (): Partial<Thing> => ({
  title: '',
  published: false,
  // ...
});
```

3. **Build the form component** — A function component following the shared form pattern: `useState` for the draft, a `set` helper, form fields with the standard styling, and the dual-button save footer. Accept `initial`, `onSave`, `onCancel`, and `saving` props.

4. **Add state variables** — In the main admin component: a state array for the list, `newThing` (boolean), `editThingId` (string | null), and reuse the shared `saving`, `deleteConfirm`, and `saveError` states.

5. **Add CRUD functions** — `saveThing` (handles both insert and update based on `data.id`), `deleteThing`. Each sets `saving`/`saveError` appropriately and calls `load()` on success.

6. **Add to the data load** — Add the new table to the `Promise.all` array in the `load` function.

7. **Add the tab definition** — Add an entry to `tabDefs` with key, label, count, and icon.

8. **Build the list view** — Following the shared list pattern: a "New" button, an `AnimatePresence` block for the new-item form, and a list of items with inline expand, delete confirmation, and empty state.

9. **Create the database migration** — Table definition with RLS policies (or equivalent for the database type). Add a storage bucket if the module has file uploads.

10. **Verify** — Run the build, check for type errors, test the CRUD flow in the browser.

### Worked example: Adding a "Testimonials" module

**Step 1 — Type:**
```typescript
type Testimonial = {
  id: string;
  author: string;
  role: string | null;
  company: string | null;
  quote: string;
  avatar_url: string | null;
  published: boolean;
  created_at: string;
};
```

**Step 2 — Factory:**
```typescript
const emptyTestimonial = (): Partial<Testimonial> => ({
  author: '', role: '', company: '', quote: '', avatar_url: '', published: false,
});
```

**Step 3 — Form:** Build `TestimonialForm` with fields: Author (required), Role, Company, Quote (textarea, required), Avatar URL (optional). Dual-button save footer.

**Step 4 — State:** `const [testimonials, setTestimonials] = useState<Testimonial[]>([]);` plus `newTestimonial`, `editTestimonialId`.

**Step 5 — CRUD:**
```typescript
const saveTestimonial = async (data: Partial<Testimonial>) => {
  setSaving(true);
  if (data.id) {
    const { error } = await supabase.from('testimonials').update({ ... }).eq('id', data.id);
    // handle error
  } else {
    const { error } = await supabase.from('testimonials').insert([{ ... }]);
    // handle error
  }
  setSaving(false); load();
};
```

**Step 6 — Load:** Add `supabase.from('testimonials').select('*').order('created_at', { ascending: false })` to the `Promise.all`.

**Step 7 — Tab:** `{ key: 'testimonials', label: 'Testimonials', count: testimonials.length, icon: Quote }`.

**Step 8 — List view:** Same pattern as blog posts — list with inline expand, delete confirmation, empty state.

**Step 9 — Migration:**
```sql
CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL,
  role text,
  company text,
  quote text NOT NULL,
  avatar_url text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_published_testimonials" ON testimonials FOR SELECT TO anon USING (published = true);
CREATE POLICY "select_all_testimonials_auth" ON testimonials FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_testimonials_auth" ON testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_testimonials_auth" ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_testimonials_auth" ON testimonials FOR DELETE TO authenticated USING (true);
```

### Adding a new integration

1. Add a settings card for the API key (new row in the settings table).
2. Create an edge function (or API endpoint) following one of the three patterns above.
3. Add UI in the admin panel to call the function.
4. Set any additional secrets in the project's secret management.

---

## File organization

When building the admin panel, keep the file structure consistent:

- **Admin page:** `src/pages/Admin.tsx` — the main admin component with auth gate, tabs, and all module state. For large panels, split forms into `src/components/admin/` (e.g., `BlogForm.tsx`, `PRForm.tsx`).
- **Shared components:** `src/components/` — `AnalyticsDashboard.tsx`, `MediaLibrary.tsx`, and any module-specific components.
- **Database client:** `src/lib/supabase.ts` — the Supabase client singleton.
- **Migrations:** `supabase/migrations/` — one migration per schema change, timestamped.
- **Edge functions:** `supabase/functions/<name>/index.ts` — one folder per function.
- **SEO hook:** `src/hooks/useSEO.ts` — the per-page SEO metadata hook.

Keep the admin page under ~1500 lines. If it grows beyond that, extract form components into separate files under `src/components/admin/`. The shared state (saving, saveError, deleteConfirm, loading) stays in the main admin component and is passed as props to extracted forms.

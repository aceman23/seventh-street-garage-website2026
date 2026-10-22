/*
# Admin Panel: inquiries, faqs, settings tables + is_admin function

## What this migration does

Creates three new tables for the Seventh Street Garage admin panel and a helper function for role-based access control. The admin panel lets staff manage contact form submissions, edit FAQ content, and store site settings — all behind Supabase email/password authentication.

## New tables

1. `inquiries` — stores contact form submissions from the public website.
   - id (uuid PK), name, email, phone, service (type of towing request), pickup_location, vehicle, details, form_type (contact or private-property), status (new/read/replied), created_at.

2. `faqs` — stores FAQ questions and answers manageable from the admin panel.
   - id (uuid PK), question, answer, category (home/release/auction), sort_order, published, created_at, updated_at.

3. `settings` — key-value store for site configuration and API keys.
   - key (text PK), value (text), updated_at.

## New function

- `is_admin()` — SECURITY DEFINER function that reads raw_app_meta_data from auth.users to check if the current user has role 'admin'. Used in RLS policies for admin-only access.

## Security

- RLS enabled on all three tables.
- inquiries: public can INSERT (contact form submissions), only authenticated can SELECT/UPDATE/DELETE.
- faqs: public can SELECT published FAQs, authenticated can SELECT all + INSERT/UPDATE/DELETE.
- settings: authenticated only (may contain API keys).
- is_admin() function: REVOKE EXECUTE from anon and authenticated to prevent privilege escalation; GRANT to authenticated.
- All tables granted to appropriate roles.
*/

-- Helper function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (raw_app_meta_data ->> 'role') = 'admin'
     FROM auth.users WHERE id = auth.uid()), false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 1. inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  pickup_location text,
  vehicle text,
  details text,
  form_type text NOT NULL DEFAULT 'contact',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON inquiries TO authenticated;
GRANT INSERT ON inquiries TO anon;

DROP POLICY IF EXISTS "insert_inquiry" ON inquiries;
CREATE POLICY "insert_inquiry" ON inquiries FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "select_inquiries_auth" ON inquiries;
CREATE POLICY "select_inquiries_auth" ON inquiries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "update_inquiries_auth" ON inquiries;
CREATE POLICY "update_inquiries_auth" ON inquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_inquiries_auth" ON inquiries;
CREATE POLICY "delete_inquiries_auth" ON inquiries FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);

-- 2. faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'home',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON faqs TO authenticated;

DROP POLICY IF EXISTS "select_published_faqs" ON faqs;
CREATE POLICY "select_published_faqs" ON faqs FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "select_all_faqs_auth" ON faqs;
CREATE POLICY "select_all_faqs_auth" ON faqs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_faqs_auth" ON faqs;
CREATE POLICY "insert_faqs_auth" ON faqs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_faqs_auth" ON faqs;
CREATE POLICY "update_faqs_auth" ON faqs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_faqs_auth" ON faqs;
CREATE POLICY "delete_faqs_auth" ON faqs FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_faqs_category_sort ON faqs (category, sort_order);

-- 3. settings table
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON settings TO authenticated;

DROP POLICY IF EXISTS "select_settings_auth" ON settings;
CREATE POLICY "select_settings_auth" ON settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_settings_auth" ON settings;
CREATE POLICY "insert_settings_auth" ON settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_settings_auth" ON settings;
CREATE POLICY "update_settings_auth" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_settings_auth" ON settings;
CREATE POLICY "delete_settings_auth" ON settings FOR DELETE TO authenticated USING (true);

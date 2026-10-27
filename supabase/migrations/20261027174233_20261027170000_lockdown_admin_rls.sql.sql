/*
# Lock down admin tables to admin-only access

## What this migration does

Tightens row-level security on the three admin-panel tables (inquiries, faqs, settings) so that
only users with the `admin` role in `raw_app_meta_data` can read, update, or delete data.
Previously, any authenticated user could manage all inquiries, FAQs, and settings. Now only
authorized admin accounts (created by the project owner via the database) can do so.

## Tables modified

1. `inquiries`
   - Public INSERT stays open so the website contact form can submit inquiries as `anon`.
   - SELECT / UPDATE / DELETE now require `is_admin()` (was: any authenticated user).
2. `faqs`
   - Public SELECT of published FAQs stays open (the website needs to read them as `anon`).
   - All other operations (SELECT all, INSERT, UPDATE, DELETE) now require `is_admin()`.
3. `settings`
   - All operations now require `is_admin()` (was: any authenticated user).

## Security changes

- Replaces the broad `TO authenticated USING (true)` policies with admin-scoped policies that
  call `is_admin()` in both the USING and WITH CHECK clauses.
- Revokes the excess INSERT/UPDATE/DELETE grants from `anon` on `inquiries` and `faqs`
  (anon only needs INSERT on inquiries and SELECT on published faqs).
- `is_admin()` is a SECURITY DEFINER function that reads `raw_app_meta_data.role = 'admin'`
  from `auth.users`. It is already granted to `authenticated` only.

## Important notes

1. Only users whose `auth.users.raw_app_meta_data` contains `{"role":"admin"}` can manage
   admin data. The project owner adds the role via the database when creating the admin
   account (see the accompanying user provisioning step).
2. The public contact form on the website continues to work: `anon` can still INSERT into
   `inquiries`.
3. The public site can still read published FAQs: `anon` SELECT on `faqs` (published = true)
   is preserved.
*/

-- inquiries: keep anon INSERT (contact form), lock everything else to admin
REVOKE INSERT, UPDATE, DELETE ON inquiries FROM anon;
GRANT INSERT ON inquiries TO anon;
GRANT SELECT, UPDATE, DELETE ON inquiries TO authenticated;

DROP POLICY IF EXISTS "insert_inquiry" ON inquiries;
CREATE POLICY "insert_inquiry" ON inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_inquiries_auth" ON inquiries;
CREATE POLICY "select_inquiries_auth" ON inquiries FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "update_inquiries_auth" ON inquiries;
CREATE POLICY "update_inquiries_auth" ON inquiries FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delete_inquiries_auth" ON inquiries;
CREATE POLICY "delete_inquiries_auth" ON inquiries FOR DELETE TO authenticated USING (is_admin());

-- faqs: keep anon SELECT (published only), lock everything else to admin
REVOKE INSERT, UPDATE, DELETE ON faqs FROM anon;
GRANT SELECT ON faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON faqs TO authenticated;

DROP POLICY IF EXISTS "select_published_faqs" ON faqs;
CREATE POLICY "select_published_faqs" ON faqs FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "select_all_faqs_auth" ON faqs;
CREATE POLICY "select_all_faqs_auth" ON faqs FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "insert_faqs_auth" ON faqs;
CREATE POLICY "insert_faqs_auth" ON faqs FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "update_faqs_auth" ON faqs;
CREATE POLICY "update_faqs_auth" ON faqs FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delete_faqs_auth" ON faqs;
CREATE POLICY "delete_faqs_auth" ON faqs FOR DELETE TO authenticated USING (is_admin());

-- settings: admin-only for all operations
REVOKE SELECT, INSERT, UPDATE, DELETE ON settings FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON settings TO authenticated;

DROP POLICY IF EXISTS "select_settings_auth" ON settings;
CREATE POLICY "select_settings_auth" ON settings FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "insert_settings_auth" ON settings;
CREATE POLICY "insert_settings_auth" ON settings FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "update_settings_auth" ON settings;
CREATE POLICY "update_settings_auth" ON settings FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delete_settings_auth" ON settings;
CREATE POLICY "delete_settings_auth" ON settings FOR DELETE TO authenticated USING (is_admin());

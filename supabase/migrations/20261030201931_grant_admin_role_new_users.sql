/*
# Grant admin role to new admin accounts

## What this does
Sets `role = 'admin'` in `raw_app_meta_data` for `nathan@opg5.com` and
`ansalmar.anton@gmail.com` so the admin panel recognizes them as admins.

The `is_admin()` SECURITY DEFINER function checks
`raw_app_meta_data ->> 'role' = 'admin'` to gate every RLS policy on
inquiries, FAQs, settings, and vehicles. Without this metadata, a
signed-in user sees zero rows in the admin panel even though the data
exists.

## Security
- No RLS or policy changes — only user metadata is updated.
- `raw_app_meta_data` is user-immutable (set server-side only), so this
  is the correct channel for authorization data.
*/

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
WHERE lower(email) IN ('nathan@opg5.com', 'ansalmar.anton@gmail.com')
  AND deleted_at IS NULL;

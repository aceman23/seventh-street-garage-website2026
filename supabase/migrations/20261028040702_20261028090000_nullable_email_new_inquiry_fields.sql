/*
# Make inquiries.email nullable + add dropoff and company columns

## What this migration does

1. Alters the `inquiries` table:
   - Makes `email` nullable (was NOT NULL) so the contact form can be submitted
     with name + phone only.
   - Adds `dropoff` (text, nullable) — drop-off location from the contact form.
   - Adds `company` (text, nullable) — company/property name from the private-property form.

2. No security changes — existing RLS policies already allow anon INSERT
   and authenticated full CRUD. The new columns are nullable so existing
   INSERT policies (`WITH CHECK (true)`) remain valid.

## Important notes
- This is non-destructive: no data is lost, no columns are dropped or renamed.
- The anon INSERT policy already uses `WITH CHECK (true)` so no policy change needed.
*/

ALTER TABLE inquiries ALTER COLUMN email DROP NOT NULL;

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS dropoff text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS company text;

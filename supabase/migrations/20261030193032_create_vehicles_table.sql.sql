/*
# Create vehicles table for vehicle search

## What this migration does

Creates a `vehicles` table that stores impounded/towed vehicle records that the
public can search by VIN or license plate. Admin users can add, edit, and delete
vehicle records through the admin panel.

## New table: vehicles

- `id` (uuid, primary key)
- `vin` (text, nullable) — Vehicle Identification Number (17 chars typical)
- `license_plate` (text, nullable) — License plate number
- `plate_state` (text, nullable) — State where plate is registered (e.g. CA)
- `year` (int, nullable) — Vehicle year
- `make` (text, nullable) — Vehicle manufacturer (e.g. Toyota)
- `model` (text, nullable) — Vehicle model (e.g. Camry)
- `color` (text, nullable) — Vehicle color
- `status` (text, not null, default 'stored') — One of: stored, released, auction, hold
- `tow_date` (timestamptz, nullable) — When the vehicle was towed
- `location` (text, nullable) — Which yard the vehicle is at
- `notes` (text, nullable) — Internal notes visible to admin only
- `public_note` (text, nullable) — Note visible to public searchers
- `image_url` (text, nullable) — URL to a vehicle photo
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security

- RLS enabled on `vehicles`.
- Public (anon) can SELECT — the search page needs to find vehicles without login.
- Only admin (is_admin()) can INSERT, UPDATE, DELETE.
- Grants: SELECT to anon + authenticated; INSERT/UPDATE/DELETE to authenticated only.
*/

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vin text,
  license_plate text,
  plate_state text,
  year int,
  make text,
  model text,
  color text,
  status text NOT NULL DEFAULT 'stored',
  tow_date timestamptz,
  location text,
  notes text,
  public_note text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vehicles_vin_lower ON vehicles (lower(vin));
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_lower ON vehicles (lower(license_plate));
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);

GRANT SELECT ON vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON vehicles TO authenticated;

DROP POLICY IF EXISTS "select_vehicles_public" ON vehicles;
CREATE POLICY "select_vehicles_public" ON vehicles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_vehicles_admin" ON vehicles;
CREATE POLICY "insert_vehicles_admin" ON vehicles FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "update_vehicles_admin" ON vehicles;
CREATE POLICY "update_vehicles_admin" ON vehicles FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delete_vehicles_admin" ON vehicles;
CREATE POLICY "delete_vehicles_admin" ON vehicles FOR DELETE
  TO authenticated USING (is_admin());

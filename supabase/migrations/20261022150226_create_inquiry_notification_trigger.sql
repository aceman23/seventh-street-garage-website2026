/*
# Email notification trigger on new inquiries

## What this migration does

Creates a database trigger that fires whenever a new row is inserted into the `inquiries` table. The trigger constructs a JSON payload with the inquiry data and sends it to the `notify-inquiry` edge function via an HTTP POST request. The edge function then formats and sends an email notification using the Resend API.

## How it works

1. A trigger function `notify_new_inquiry()` is created as `SECURITY DEFINER` so it can make outbound HTTP calls.
2. The function uses `pg_net` extension's `net.http_post` to send a POST request to the edge function URL.
3. The edge function URL is constructed from the Supabase project URL: `https://<project-ref>.supabase.co/functions/v1/notify-inquiry`.
4. The trigger fires `AFTER INSERT` on the `inquiries` table, once per row.
5. The HTTP request is asynchronous (post to background) so it doesn't block the insert.

## Security

- The trigger function is `SECURITY DEFINER` with `search_path = public, extensions` for safe execution.
- The edge function has `verify_jwt = false` since it's called by the database, not by a browser.
- The edge function reads the notification email address and Resend API key from the `settings` table, so the admin can configure them without touching code.
- `pg_net` extension is needed for outbound HTTP from Postgres.
*/

-- Enable pg_net for outbound HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_new_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  project_url text;
  function_url text;
  service_role_key text;
BEGIN
  -- Construct the edge function URL from the Supabase project URL
  project_url := current_setting('app.supabase_url', true);
  IF project_url IS NULL OR project_url = '' THEN
    -- Fallback: construct from the database URL pattern
    project_url := 'https://oqcjzccpbweakfdprelx.supabase.co';
  END IF;
  function_url := project_url || '/functions/v1/notify-inquiry';

  -- Get the service role key for auth (needed if verify_jwt were true; kept for future use)
  service_role_key := current_setting('app.service_role_key', true);

  -- Fire the HTTP request asynchronously (don't block the insert)
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'record', to_jsonb(NEW)
    )
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if re-running
DROP TRIGGER IF EXISTS trigger_notify_new_inquiry ON inquiries;

-- Create the trigger: fires after each insert
CREATE TRIGGER trigger_notify_new_inquiry
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_inquiry();

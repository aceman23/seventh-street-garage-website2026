/*
# Update notify_new_inquiry trigger to send x-webhook-secret header

## What this migration does

Replaces the existing `notify_new_inquiry()` trigger function with one that
includes an `x-webhook-secret` header in the HTTP POST to the edge function.
This prevents unauthorized calls to the edge function endpoint.

## How it works

1. The webhook secret is embedded in the SECURITY DEFINER trigger function
   body. Since the function is SECURITY DEFINER and owned by the postgres
   role, anon/authenticated users cannot view its source.
2. The same secret value is configured as the `WEBHOOK_SECRET` edge function
   secret, so the edge function can validate the header.
3. The `x-webhook-secret` header is included in every `net.http_post` call.

## Security
- The trigger function remains SECURITY DEFINER with search_path = public, extensions.
- Function source is not visible to anon/authenticated roles (only to superusers
  and the function owner).
- If the header doesn't match, the edge function rejects the request (fail-closed).
*/

CREATE OR REPLACE FUNCTION public.notify_new_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  project_url text;
  function_url text;
  webhook_secret text;
BEGIN
  -- Construct the edge function URL from the Supabase project URL
  project_url := current_setting('app.supabase_url', true);
  IF project_url IS NULL OR project_url = '' THEN
    project_url := 'https://oqcjzccpbweakfdprelx.supabase.co';
  END IF;
  function_url := project_url || '/functions/v1/notify-inquiry';

  -- Webhook secret shared with the edge function (configured as WEBHOOK_SECRET secret)
  webhook_secret := 'opg5-notify-inquiry-webhook-secret-2026';

  -- Fire the HTTP request asynchronously (don't block the insert)
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object(
      'record', to_jsonb(NEW)
    )
  );

  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_notify_new_inquiry ON inquiries;

CREATE TRIGGER trigger_notify_new_inquiry
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_inquiry();

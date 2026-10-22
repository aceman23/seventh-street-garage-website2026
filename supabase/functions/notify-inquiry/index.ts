import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InquiryPayload {
  record: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    service: string | null;
    pickup_location: string | null;
    vehicle: string | null;
    details: string | null;
    form_type: string;
    status: string;
    created_at: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: InquiryPayload = await req.json();
    const inq = body.record;
    if (!inq || !inq.id) {
      return new Response(JSON.stringify({ error: "Missing inquiry record" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Read notification email + Resend API key from settings table
    const { data: emailSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "notification_email")
      .maybeSingle();

    const { data: resendKeySetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "resend_api_key")
      .maybeSingle();

    const notifyEmail = emailSetting?.value || "";
    const resendKey = resendKeySetting?.value || Deno.env.get("RESEND_API_KEY") || "";

    if (!notifyEmail) {
      return new Response(
        JSON.stringify({ message: "No notification_email setting configured — skipping email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!resendKey) {
      return new Response(
        JSON.stringify({ message: "No resend_api_key setting or RESEND_API_KEY env — skipping email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const dateStr = new Date(inq.created_at).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const formLabel = inq.form_type === "private-property" ? "Private Property Towing" : "Contact Form";

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#f7f8fa;padding:24px">
        <div style="background:#0A1020;border-radius:8px 8px 0 0;padding:20px 24px">
          <h1 style="color:#FFB81C;font-size:18px;margin:0;font-style:italic;text-transform:uppercase;letter-spacing:.02em">New Inquiry — Seventh Street Garage</h1>
        </div>
        <div style="background:#fff;border:1px solid #D5DAE3;border-top:0;border-radius:0 0 8px 8px;padding:24px">
          <p style="color:#556074;font-size:13px;margin:0 0 16px;font-family:monospace">${dateStr} · ${formLabel}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#121A2C">
            <tr><td style="padding:6px 0;width:120px;color:#556074;font-weight:600">Name</td><td style="padding:6px 0"><b>${esc(inq.name)}</b></td></tr>
            ${inq.phone ? `<tr><td style="padding:6px 0;color:#556074;font-weight:600">Phone</td><td style="padding:6px 0"><a href="tel:${esc(inq.phone)}" style="color:#13213F">${esc(inq.phone)}</a></td></tr>` : ""}
            <tr><td style="padding:6px 0;color:#556074;font-weight:600">Email</td><td style="padding:6px 0"><a href="mailto:${esc(inq.email)}" style="color:#13213F">${esc(inq.email)}</a></td></tr>
            ${inq.service ? `<tr><td style="padding:6px 0;color:#556074;font-weight:600">Service</td><td style="padding:6px 0">${esc(inq.service)}</td></tr>` : ""}
            ${inq.pickup_location ? `<tr><td style="padding:6px 0;color:#556074;font-weight:600">Location</td><td style="padding:6px 0">${esc(inq.pickup_location)}</td></tr>` : ""}
            ${inq.vehicle ? `<tr><td style="padding:6px 0;color:#556074;font-weight:600">Vehicle</td><td style="padding:6px 0">${esc(inq.vehicle)}</td></tr>` : ""}
          </table>
          ${inq.details ? `<div style="margin-top:16px;padding:14px;background:#F7F8FA;border-radius:6px;border-left:3px solid #FFB81C"><p style="margin:0;font-size:14px;color:#121A2C;line-height:1.5">${esc(inq.details)}</p></div>` : ""}
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #D5DAE3">
            <a href="${supabaseUrl.replace('.supabase.co', '.supabase.co')}/admin" style="display:inline-block;background:#FFB81C;color:#0A1020;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;text-transform:uppercase">View in Admin Panel</a>
          </div>
        </div>
        <p style="text-align:center;color:#A8B2C7;font-size:11px;margin-top:16px">Seventh Street Garage · (310) 856-1980 · 24/7 Dispatch</p>
      </div>
    `;

    const textBody = [
      `New Inquiry — Seventh Street Garage`,
      ``,
      `Date: ${dateStr}`,
      `Form: ${formLabel}`,
      ``,
      `Name: ${inq.name}`,
      inq.phone ? `Phone: ${inq.phone}` : "",
      `Email: ${inq.email}`,
      inq.service ? `Service: ${inq.service}` : "",
      inq.pickup_location ? `Location: ${inq.pickup_location}` : "",
      inq.vehicle ? `Vehicle: ${inq.vehicle}` : "",
      inq.details ? `Details: ${inq.details}` : "",
      ``,
      `View in admin panel at ${supabaseUrl}/admin`,
    ].filter(Boolean).join("\n");

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Seventh Street Garage <onboarding@resend.dev>",
        to: [notifyEmail],
        subject: `New ${formLabel} inquiry from ${inq.name}`,
        html,
        text: textBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      return new Response(
        JSON.stringify({ error: `Resend API error: ${resendRes.status}`, detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ message: "Email notification sent", to: notifyEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

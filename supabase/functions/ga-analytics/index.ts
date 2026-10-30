const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const propertyId = Deno.env.get("GA_PROPERTY_ID") ?? "";
    const clientEmail = Deno.env.get("GA_CLIENT_EMAIL") ?? "";
    const privateKeyRaw = Deno.env.get("GA_PRIVATE_KEY") ?? "";

    if (!propertyId || !clientEmail || !privateKeyRaw) {
      return new Response(
        JSON.stringify({
          error: "NOT_CONFIGURED",
          message:
            "Google Analytics is not connected yet. Ask the site administrator to add the GA4 service account secrets."
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Handle escaped newlines in private key (common when stored as env var)
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

    // Sign JWT for Google service account authentication
    const token = await signJwt(clientEmail, privateKey);

    // Query GA4 Data API for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().slice(0, 10);
    const endDate = now.toISOString().slice(0, 10);

    const gaRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
            { name: "screenPageViews" },
            { name: "newUsers" },
          ],
          dimensions: [
            { name: "date" },
            { name: "sessionDefaultChannelGroup" },
            { name: "pageTitle" },
            { name: "pagePath" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" }, desc: true }],
          limit: 100,
        }),
      },
    );

    if (!gaRes.ok) {
      const errText = await gaRes.text();
      return new Response(
        JSON.stringify({ error: "GA_API_ERROR", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const gaData = await gaRes.json();

    // Process the report data
    const metrics = {
      activeUsers: 0,
      sessions: 0,
      averageSessionDuration: 0,
      screenPageViews: 0,
      newUsers: 0,
    };

    const dailyData: { date: string; activeUsers: number; sessions: number }[] = [];
    const channelData: Record<string, number> = {};
    const pageData: Record<string, { title: string; path: string; views: number }> = {};

    if (gaData.rows) {
      for (const row of gaData.rows) {
        const date = row.dimensionValues[0]?.value ?? "";
        const channel = row.dimensionValues[1]?.value ?? "Direct";
        const title = row.dimensionValues[2]?.value ?? "";
        const path = row.dimensionValues[3]?.value ?? "/";

        const au = parseInt(row.metricValues[0]?.value ?? "0", 10);
        const sess = parseInt(row.metricValues[1]?.value ?? "0", 10);
        const avgDur = parseFloat(row.metricValues[2]?.value ?? "0");
        const pv = parseInt(row.metricValues[3]?.value ?? "0", 10);
        const nu = parseInt(row.metricValues[4]?.value ?? "0", 10);

        metrics.activeUsers += au;
        metrics.sessions += sess;
        metrics.averageSessionDuration += avgDur;
        metrics.screenPageViews += pv;
        metrics.newUsers += nu;

        // Daily data (aggregate by date)
        const existing = dailyData.find((d) => d.date === date);
        if (existing) {
          existing.activeUsers += au;
          existing.sessions += sess;
        } else {
          dailyData.push({ date, activeUsers: au, sessions: sess });
        }

        // Channel data
        channelData[channel] = (channelData[channel] ?? 0) + nu;

        // Page data
        const pageKey = path;
        if (pageData[pageKey]) {
          pageData[pageKey].views += pv;
        } else {
          pageData[pageKey] = { title, path, views: pv };
        }
      }
    }

    // Average session duration is already a per-row metric; divide by sessions for the true average
    if (metrics.sessions > 0) {
      metrics.averageSessionDuration = metrics.averageSessionDuration / metrics.sessions;
    }

    // Sort daily data oldest first for sparkline
    dailyData.sort((a, b) => a.date.localeCompare(b.date));

    // Top pages by views
    const topPages = Object.values(pageData)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Channel data sorted by new users
    const channels = Object.entries(channelData)
      .map(([name, users]) => ({ name, users }))
      .sort((a, b) => b.users - a.users);

    return new Response(
      JSON.stringify({
        dateRange: { startDate, endDate },
        metrics,
        dailyData,
        channels,
        topPages,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Analytics is temporarily unavailable." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// Sign a JWT for Google service account authentication using Web Crypto API
async function signJwt(clientEmail: string, privateKeyPem: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encHeader = base64url(JSON.stringify(header));
  const encPayload = base64url(JSON.stringify(payload));
  const unsigned = `${encHeader}.${encPayload}`;

  const key = await importPemKey(privateKeyPem);
  const sig = await crypto.subtle.sign("RS256", key, new TextEncoder().encode(unsigned));
  const encSig = b64encode(new Uint8Array(sig));

  return `${unsigned}.${encSig}`;
}

async function importPemKey(pem: string): Promise<CryptoKey> {
  // Strip PEM headers and decode base64
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const der = base64ToUint8Array(pemContents);

  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64encode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAPIDAPI_HOST = "instagram-statistics-api.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) {
      throw new Error("RAPIDAPI_KEY is not configured");
    }

    const { handle } = await req.json();

    if (!handle) {
      return new Response(
        JSON.stringify({ error: "Instagram handle is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanHandle = handle.replace(/^@/, "").trim();

    const headers = {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    };

    // Use /search endpoint which returns comprehensive profile data
    const url = `${BASE_URL}/search?q=${encodeURIComponent(cleanHandle)}&perPage=5`;
    console.log("Fetching Instagram data for:", cleanHandle);

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Instagram Statistics API failed [${res.status}]: ${errText}`);
    }

    const result = await res.json();

    // Find the best matching profile by screenName
    const profiles = result?.data || [];
    const exactMatch = profiles.find(
      (p: any) => p.screenName?.toLowerCase() === cleanHandle.toLowerCase()
    );
    const profile = exactMatch || profiles[0] || null;

    if (!profile) {
      return new Response(
        JSON.stringify({ success: false, error: "No Instagram profile found for this handle" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize the data into a clean structure
    const normalized = {
      cid: profile.cid,
      name: profile.name,
      screenName: profile.screenName,
      image: profile.image,
      url: profile.url,
      verified: profile.verified,
      followers: profile.usersCount || 0,
      tags: profile.tags || [],
      avgEngagementRate: profile.avgER || 0,
      avgLikes: profile.avgLikes || 0,
      avgComments: profile.avgComments || 0,
      avgInteractions: profile.avgInteractions || 0,
      avgViews: profile.avgViews || null,
      avgVideoLikes: profile.avgVideoLikes || 0,
      avgVideoComments: profile.avgVideoComments || 0,
      avgVideoViews: profile.avgVideoViews || 0,
      qualityScore: profile.qualityScore || 0,
    };

    return new Response(
      JSON.stringify({ success: true, data: normalized }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Instagram Stats error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

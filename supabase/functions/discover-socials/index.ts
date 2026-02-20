import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SOCIAL_PATTERNS: Record<string, RegExp[]> = {
  instagram: [
    /https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?/gi,
  ],
  facebook: [
    /https?:\/\/(?:www\.)?facebook\.com\/([a-zA-Z0-9_.]+)\/?/gi,
  ],
  tiktok: [
    /https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/?/gi,
  ],
  youtube: [
    /https?:\/\/(?:www\.)?youtube\.com\/@([a-zA-Z0-9_.]+)\/?/gi,
    /https?:\/\/(?:www\.)?youtube\.com\/(?:c|channel|user)\/([a-zA-Z0-9_.]+)\/?/gi,
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ success: false, error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Fetching URL:", formattedUrl);

    const res = await fetch(formattedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SocialPulseBot/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, error: `Could not fetch website (${res.status})` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = await res.text();
    const found: Record<string, string> = {};

    for (const [platform, regexes] of Object.entries(SOCIAL_PATTERNS)) {
      for (const regex of regexes) {
        // Reset regex state
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(html)) !== null) {
          const handle = match[1];
          // Skip generic handles
          if (!["share", "sharer", "intent", "dialog", "login", "signup", "help", "about", "policies", "legal"].includes(handle.toLowerCase())) {
            found[platform] = handle;
            break;
          }
        }
        if (found[platform]) break;
      }
    }

    console.log("Discovered socials:", found);

    return new Response(JSON.stringify({ success: true, socials: found }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("discover-socials error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

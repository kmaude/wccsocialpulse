import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function searchInstagram(query: string, rapidApiKey: string) {
  const res = await fetch(
    `https://instagram-statistics-api.p.rapidapi.com/search?q=${encodeURIComponent(query)}&perPage=5`,
    {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "instagram-statistics-api.p.rapidapi.com",
      },
    }
  );
  if (!res.ok) throw new Error(`Instagram search failed: ${res.status}`);
  const data = await res.json();
  const items = Array.isArray(data) ? data : data?.data || [];
  return items.map((r: any) => ({
    platform: "instagram",
    handle: r.screenName || r.username || "",
    display_name: r.name || r.screenName || "",
    follower_count: r.usersCount || r.followers || null,
    bio: r.description || "",
    avatar_url: r.image || r.avatar || "",
  }));
}

async function searchYouTube(query: string, ytKey: string) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=5&key=${ytKey}`
  );
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((r: any) => ({
    platform: "youtube",
    handle: r.snippet?.channelTitle || "",
    display_name: r.snippet?.channelTitle || "",
    follower_count: null,
    bio: r.snippet?.description || "",
    avatar_url: r.snippet?.thumbnails?.default?.url || "",
  }));
}

async function searchTikTok(query: string, svKey: string) {
  const res = await fetch(
    `https://api.sociavault.com/v1/scrape/tiktok/profile?username=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${svKey}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const p = data?.data || data;
  if (!p?.username && !p?.uniqueId) return [];
  return [{
    platform: "tiktok",
    handle: p.uniqueId || p.username || query,
    display_name: p.nickname || p.uniqueId || query,
    follower_count: p.followerCount || p.fans || null,
    bio: p.signature || "",
    avatar_url: p.avatarUrl || p.avatarMedium || "",
  }];
}

async function searchFacebook(query: string, svKey: string) {
  const res = await fetch(
    `https://api.sociavault.com/v1/scrape/facebook/profile?username=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${svKey}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const p = data?.data || data;
  if (!p?.name && !p?.username) return [];
  return [{
    platform: "facebook",
    handle: p.username || query,
    display_name: p.name || query,
    follower_count: p.followerCount || p.followers || null,
    bio: p.about || "",
    avatar_url: p.profilePicUrl || p.profilePic || "",
  }];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ success: false, error: "Query too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY") || "";
    const ytKey = Deno.env.get("YOUTUBE_API_KEY") || "";
    const svKey = Deno.env.get("SOCIAVAULT_API_KEY") || "";

    const searches: Promise<any[]>[] = [];
    if (rapidApiKey) searches.push(searchInstagram(query.trim(), rapidApiKey));
    if (ytKey) searches.push(searchYouTube(query.trim(), ytKey));
    if (svKey) {
      searches.push(searchTikTok(query.trim(), svKey));
      searches.push(searchFacebook(query.trim(), svKey));
    }

    const results = await Promise.allSettled(searches);
    const candidates = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    return new Response(JSON.stringify({ success: true, candidates }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("search-competitor error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function clean(handle?: string): string | null {
  if (!handle) return null;
  const h = handle.replace(/^@/, "").trim();
  return h.length > 0 ? h : null;
}

function lerp(value: number, breakpoints: [number, number][]): number {
  if (value <= breakpoints[0][0]) return breakpoints[0][1];
  for (let i = 1; i < breakpoints.length; i++) {
    const [x0, y0] = breakpoints[i - 1];
    const [x1, y1] = breakpoints[i];
    if (value <= x1) {
      return y0 + ((value - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return breakpoints[breakpoints.length - 1][1];
}

function parseISO8601Duration(dur: string): number {
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || "0") * 3600) + (parseInt(m[2] || "0") * 60) + parseInt(m[3] || "0");
}

function daysSince(dateStr: string): number {
  return Math.max(0, (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

// ── Platform Fetchers ────────────────────────────────────────────────────────

interface PlatformResult {
  available: boolean;
  collecting?: boolean;
  error?: string;
  followers: number;
  engagementRate?: number;
  posts: PostData[];
  raw?: any;
}

interface PostData {
  platform: string;
  type: string;
  content: string;
  likes: number;
  comments: number;
  views: number | null;
  date: string;
  engagement_rate: number;
  external_id: string;
}

async function fetchInstagram(handle: string): Promise<PlatformResult> {
  const key = Deno.env.get("RAPIDAPI_KEY");
  if (!key) return { available: false, error: "RAPIDAPI_KEY not configured", followers: 0, posts: [] };

  const host = "instagram-statistics-api.p.rapidapi.com";
  const headers = { "x-rapidapi-key": key, "x-rapidapi-host": host };

  // Step 1: Get profile data (followers, avgER, cid)
  const profileUrl = `https://${host}/community?url=https://www.instagram.com/${handle}`;
  const profileRes = await fetch(profileUrl, { headers });
  if (!profileRes.ok) {
    const t = await profileRes.text();
    return { available: false, error: `API ${profileRes.status}: ${t.slice(0, 200)}`, followers: 0, posts: [] };
  }
  const profileData = await profileRes.json();

  const followers = profileData?.usersCount || 0;
  const collecting = profileData?.communityStatus === "COLLECTING";
  const avgER = profileData?.avgER || 0;
  const cid = profileData?.cid;

  // Step 2: If we have cid, fetch full post history via Feed endpoint (last 8 weeks)
  let posts: PostData[] = [];

  if (cid && !collecting) {
    try {
      const now = new Date();
      const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);
      
      const fromDate = `${String(eightWeeksAgo.getDate()).padStart(2, '0')}.${String(eightWeeksAgo.getMonth() + 1).padStart(2, '0')}.${eightWeeksAgo.getFullYear()}`;
      const toDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

      const feedUrl = `https://${host}/feed?cid=${encodeURIComponent(cid)}&from=${fromDate}&to=${toDate}&type=posts&sort=-date`;
      console.log("Fetching Instagram feed:", feedUrl);
      
      const feedRes = await fetch(feedUrl, { headers });
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        const feedPosts = feedData?.posts || feedData?.data || [];
        
        if (Array.isArray(feedPosts) && feedPosts.length > 0) {
          posts = feedPosts.slice(0, 50).map((p: any, i: number) => {
            const likes = p.likes || 0;
            const comments = p.comments || 0;
            const views = p.views || p.videoViews || null;
            
            const rawType = (p.type || "").toLowerCase();
            let type = "image";
            if (rawType.includes("reel")) type = "reel";
            else if (rawType.includes("video")) type = "video";
            else if (rawType === "graphsidecar" || rawType.includes("carousel") || rawType.includes("sidecar")) type = "carousel";
            
            let dateStr: string;
            if (typeof p.date === "number") {
              dateStr = new Date(p.date * 1000).toISOString();
            } else if (typeof p.date === "string") {
              dateStr = new Date(p.date).toISOString();
            } else {
              dateStr = new Date().toISOString();
            }

            return {
              platform: "instagram",
              type,
              content: (p.text || p.description || "").slice(0, 200),
              likes,
              comments,
              views,
              date: dateStr,
              engagement_rate: followers > 0 ? (likes + comments) / followers * 100 : 0,
              external_id: `instagram_${p.postID || p.socialPostID || p.id || i}`,
            };
          });
          
          console.log(`Instagram Feed returned ${feedPosts.length} posts, using ${posts.length}`);
        }
      } else {
        console.warn("Feed endpoint failed, falling back to lastPosts:", feedRes.status);
      }
    } catch (feedErr) {
      console.warn("Feed endpoint error, falling back to lastPosts:", feedErr);
    }
  }

  // Step 3: Fallback to lastPosts from profile if Feed returned nothing
  if (posts.length === 0) {
    const lastPosts = profileData?.lastPosts || [];
    posts = lastPosts.map((p: any, i: number) => {
      const likes = p.likes || 0;
      const comments = p.comments || 0;
      const rawType = (p.type || "").toLowerCase();
      const type = rawType.includes("video") || rawType.includes("reel") ? "reel" : rawType === "graphsidecar" ? "carousel" : "image";
      return {
        platform: "instagram",
        type,
        content: (p.text || "").slice(0, 200),
        likes,
        comments,
        views: null,
        date: p.date ? new Date(p.date * 1000).toISOString() : new Date().toISOString(),
        engagement_rate: followers > 0 ? (likes + comments) / followers * 100 : 0,
        external_id: `instagram_${p.id || i}`,
      };
    });
  }

  return { available: true, collecting, followers, engagementRate: avgER, posts, raw: profileData };
}

async function fetchYouTube(handle: string): Promise<PlatformResult> {
  const key = Deno.env.get("YOUTUBE_API_KEY");
  if (!key) return { available: false, error: "YOUTUBE_API_KEY not configured", followers: 0, posts: [] };

  let channelId: string | null = null;
  let channelStats: any = null;

  // Try forHandle first
  const chUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&forHandle=${handle}&key=${key}`;
  const chRes = await fetch(chUrl);
  const chData = await chRes.json();

  if (chData.items?.length > 0) {
    channelId = chData.items[0].id;
    channelStats = chData.items[0].statistics;
  } else {
    // Fallback: search
    const sUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1&key=${key}`;
    const sRes = await fetch(sUrl);
    const sData = await sRes.json();
    if (sData.items?.length > 0) {
      channelId = sData.items[0].id?.channelId || sData.items[0].snippet?.channelId;
    }
    if (channelId) {
      const c2 = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${key}`);
      const c2d = await c2.json();
      channelStats = c2d.items?.[0]?.statistics;
    }
  }

  if (!channelId || !channelStats) {
    return { available: false, error: "Channel not found", followers: 0, posts: [] };
  }

  const followers = parseInt(channelStats.subscriberCount || "0");

  // Get recent videos
  const vSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=12&key=${key}`;
  const vRes = await fetch(vSearchUrl);
  const vData = await vRes.json();
  const videoIds = (vData.items || []).map((v: any) => v.id?.videoId).filter(Boolean);

  const posts: PostData[] = [];
  if (videoIds.length > 0) {
    const detUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds.join(",")}&key=${key}`;
    const detRes = await fetch(detUrl);
    const detData = await detRes.json();

    for (const v of detData.items || []) {
      const dur = parseISO8601Duration(v.contentDetails?.duration || "PT0S");
      const type = dur < 60 ? "short" : "video";
      const likes = parseInt(v.statistics?.likeCount || "0");
      const comments = parseInt(v.statistics?.commentCount || "0");
      const views = parseInt(v.statistics?.viewCount || "0");
      posts.push({
        platform: "youtube",
        type,
        content: (v.snippet?.title || "").slice(0, 200),
        likes,
        comments,
        views,
        date: v.snippet?.publishedAt || new Date().toISOString(),
        engagement_rate: followers > 0 ? (likes + comments) / followers * 100 : 0,
        external_id: `youtube_${v.id}`,
      });
    }
  }

  return { available: true, followers, posts };
}

async function fetchFacebook(handle: string): Promise<PlatformResult> {
  const key = Deno.env.get("SOCIAVAULT_API_KEY");
  if (!key) return { available: false, error: "SOCIAVAULT_API_KEY not configured", followers: 0, posts: [] };

  try {
    const res = await fetch(`https://api.sociavault.com/v1/scrape/facebook/profile?username=${encodeURIComponent(handle)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { available: false, error: `API ${res.status}: ${t.slice(0, 200)}`, followers: 0, posts: [] };
    }
    const data = await res.json();
    const followers = data?.follower_count || data?.followers || 0;
    const rawPosts = data?.posts || data?.recent_posts || [];

    const posts: PostData[] = rawPosts.slice(0, 12).map((p: any, i: number) => {
      const likes = p.likes || p.like_count || 0;
      const comments = p.comments || p.comment_count || 0;
      return {
        platform: "facebook",
        type: "image",
        content: (p.text || p.content || p.message || "").slice(0, 200),
        likes,
        comments,
        views: p.views || null,
        date: p.date || p.created_at || p.created_time || new Date().toISOString(),
        engagement_rate: followers > 0 ? (likes + comments) / followers * 100 : 0,
        external_id: `facebook_${p.id || i}`,
      };
    });

    return { available: true, followers, posts };
  } catch (e: any) {
    return { available: false, error: e.message, followers: 0, posts: [] };
  }
}

async function fetchTikTok(handle: string): Promise<PlatformResult> {
  const key = Deno.env.get("SOCIAVAULT_API_KEY");
  if (!key) return { available: false, error: "SOCIAVAULT_API_KEY not configured", followers: 0, posts: [] };

  try {
    const res = await fetch(`https://api.sociavault.com/v1/scrape/tiktok/profile?username=${encodeURIComponent(handle)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { available: false, error: `API ${res.status}: ${t.slice(0, 200)}`, followers: 0, posts: [] };
    }
    const data = await res.json();
    const followers = data?.followerCount || data?.followers || 0;
    const rawVideos = data?.videos || data?.recent_videos || [];

    const posts: PostData[] = rawVideos.slice(0, 12).map((v: any, i: number) => {
      const likes = v.diggCount || v.likes || 0;
      const comments = v.commentCount || v.comments || 0;
      const views = v.playCount || v.views || 0;
      return {
        platform: "tiktok",
        type: "video",
        content: (v.desc || v.title || v.text || "").slice(0, 200),
        likes,
        comments,
        views,
        date: v.createTime ? new Date(v.createTime * 1000).toISOString() : v.date || new Date().toISOString(),
        engagement_rate: followers > 0 ? (likes + comments) / followers * 100 : 0,
        external_id: `tiktok_${v.id || i}`,
      };
    });

    return { available: true, followers, posts };
  } catch (e: any) {
    return { available: false, error: e.message, followers: 0, posts: [] };
  }
}

// ── Score Computation ────────────────────────────────────────────────────────

function computeScores(platforms: Record<string, PlatformResult>, providedPlatforms: string[]) {
  // Collect all posts
  const allPosts: PostData[] = [];
  for (const p of Object.values(platforms)) {
    if (p.available) allPosts.push(...p.posts);
  }

  // ── Velocity ──
  const now = Date.now();
  const fiftysixDaysAgo = now - 56 * 24 * 60 * 60 * 1000;
  const recentPosts = allPosts.filter(p => new Date(p.date).getTime() >= fiftysixDaysAgo);
  const postsPerWeek = recentPosts.length / 8;
  const velocityScore = Math.round(lerp(postsPerWeek, [
    [0, 0], [1, 20], [2, 35], [3, 50], [4, 65], [5, 75], [7, 85], [10, 95], [14, 100],
  ]));

  // ── Video Dominance ──
  let videoScore: number;
  if (allPosts.length === 0) {
    videoScore = 30;
  } else {
    const videoTypes = ["reel", "video", "short"];
    const videoCount = allPosts.filter(p => videoTypes.includes(p.type)).length;
    const ratio = videoCount / allPosts.length;
    videoScore = Math.round(lerp(ratio * 100, [
      [0, 10], [25, 30], [50, 55], [75, 80], [90, 95],
    ]));
  }

  // ── Engagement ──
  const platformERs: number[] = [];
  for (const [key, p] of Object.entries(platforms)) {
    if (!p.available || p.followers === 0) continue;
    if (key === "instagram" && p.engagementRate) {
      platformERs.push(p.engagementRate);
    } else if (p.posts.length > 0) {
      const avgER = p.posts.reduce((s, post) => s + post.engagement_rate, 0) / p.posts.length;
      platformERs.push(avgER);
    }
  }
  const avgER = platformERs.length > 0 ? platformERs.reduce((a, b) => a + b, 0) / platformERs.length : 0;
  const engagementScore = Math.round(lerp(avgER, [
    [0, 15], [0.5, 30], [1, 50], [2, 70], [4, 85], [7, 95],
  ]));

  // ── Competitor Gap ── (null for now, redistribute weight)
  const competitorScore = null;

  // ── Coverage ──
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const activePlatforms = providedPlatforms.filter(key => {
    const p = platforms[key];
    return p?.available && p.posts.some(post => new Date(post.date).getTime() >= thirtyDaysAgo);
  }).length;
  const coverageScore = providedPlatforms.length > 0
    ? Math.round((activePlatforms / providedPlatforms.length) * 100)
    : 0;

  // ── Recency ──
  let recencyScore = 10;
  if (allPosts.length > 0) {
    const dates = allPosts.map(p => new Date(p.date).getTime()).filter(d => !isNaN(d));
    if (dates.length > 0) {
      const mostRecent = Math.max(...dates);
      const days = (now - mostRecent) / (1000 * 60 * 60 * 24);
      recencyScore = Math.round(lerp(days, [
        [0, 100], [1, 100], [2, 85], [3, 85], [4, 65], [7, 65], [8, 40], [14, 40], [15, 20], [30, 20], [31, 5],
      ]));
    }
  }

  // ── Weights (redistribute competitor 15%) ──
  const weights = {
    velocity: 25 + 6.25,   // 31.25
    video: 20,
    engagement: 20 + 8.75, // 28.75
    competitor: 0,
    coverage: 10,
    recency: 10,
  };

  const overall = Math.round(Math.min(100, Math.max(0,
    (velocityScore * weights.velocity +
     videoScore * weights.video +
     engagementScore * weights.engagement +
     coverageScore * weights.coverage +
     recencyScore * weights.recency) / 100
  )));

  const subScores = {
    velocity: velocityScore,
    video: videoScore,
    engagement: engagementScore,
    competitor: competitorScore,
    coverage: coverageScore,
    recency: recencyScore,
  };

  const dimensions = [
    { name: "Velocity", key: "velocity", weight: weights.velocity, score: velocityScore, maxScore: 100, description: "Posting frequency & consistency across platforms" },
    { name: "Video Dominance", key: "video", weight: weights.video, score: videoScore, maxScore: 100, description: "Ratio of video content to static posts" },
    { name: "Engagement", key: "engagement", weight: weights.engagement, score: engagementScore, maxScore: 100, description: "Estimated engagement rate vs. industry average" },
    { name: "Competitor Gap", key: "competitor", weight: weights.competitor, score: competitorScore, maxScore: 100, description: "How your velocity compares to tracked competitors" },
    { name: "Coverage", key: "coverage", weight: weights.coverage, score: coverageScore, maxScore: 100, description: "Number of active platforms with recent content" },
    { name: "Recency", key: "recency", weight: weights.recency, score: recencyScore, maxScore: 100, description: "How recent your latest content is" },
  ];

  return { overall, subScores, dimensions };
}

function generateInsight(overall: number, subScores: any): string {
  if (subScores.recency < 40) return "Your most recent post is over 2 weeks old. Algorithms penalize inactivity — every day without a post is visibility lost to competitors.";
  if (subScores.velocity < 50) return "You're publishing less frequently than most brands in your space. Increasing to 4+ posts per week is the fastest way to boost your score.";
  if (subScores.video < 40) return "Less than 25% of your content is video. In 2026, video drives 3x more algorithmic reach — shifting to Reels, Shorts, and TikTok could significantly boost visibility.";
  if (subScores.engagement < 40) return "Your engagement rate is below average. Focus on hooks in your first 3 seconds (video) or first line (captions) to drive more interaction.";
  if (overall < 40) return "Your brand is in the 'Low Visibility' range. Competitors are capturing the audience attention you're missing.";
  if (overall < 60) return "You're in the 'Fading' zone — you have a foundation, but significant gaps are letting competitors pull ahead.";
  return "Your visibility is solid but there's room to grow. See your full breakdown to find where to focus.";
}

function generateRecommendations(subScores: any, platforms: Record<string, PlatformResult>): string[] {
  const dims = [
    { key: "velocity", score: subScores.velocity },
    { key: "video", score: subScores.video },
    { key: "engagement", score: subScores.engagement },
    { key: "coverage", score: subScores.coverage },
    { key: "recency", score: subScores.recency },
  ].sort((a, b) => a.score - b.score);

  const recs: string[] = [];
  for (const d of dims) {
    if (recs.length >= 3) break;
    switch (d.key) {
      case "velocity":
        recs.push(`Your posting velocity score is ${d.score}/100. Try increasing to at least 4 posts per week across your active platforms to move into the 65+ range.`);
        break;
      case "video":
        recs.push(`Video dominance is at ${d.score}/100. Shift at least 50% of your content to Reels, Shorts, or TikTok videos to reach a score of 55+.`);
        break;
      case "engagement":
        recs.push(`Engagement score is ${d.score}/100. Experiment with stronger hooks, questions in captions, and interactive Stories/polls to drive more comments and likes.`);
        break;
      case "coverage":
        recs.push(`Platform coverage scored ${d.score}/100. You have inactive platforms — post at least once in the next 30 days on each to maximize cross-platform reach.`);
        break;
      case "recency":
        recs.push(`Recency score is ${d.score}/100. Post something today — even a Story or Short — to signal freshness to platform algorithms.`);
        break;
    }
  }
  return recs;
}

// ── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const igHandle = clean(body.instagram);
    const ytHandle = clean(body.youtube);
    const fbHandle = clean(body.facebook);
    const ttHandle = clean(body.tiktok);
    const userId: string | null = body.user_id || null;

    if (!igHandle && !ytHandle && !fbHandle && !ttHandle) {
      return new Response(JSON.stringify({ success: false, error: "At least one platform handle is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Rate Limiting ──
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("x-real-ip") || "unknown";
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: rl } = await supabase.from("scan_rate_limits").select("*").eq("ip", ip).maybeSingle();
    if (rl) {
      if (new Date(rl.window_start) > new Date(oneHourAgo)) {
        if (rl.scan_count >= 10) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        await supabase.from("scan_rate_limits").update({ scan_count: rl.scan_count + 1 }).eq("ip", ip);
      } else {
        await supabase.from("scan_rate_limits").update({ scan_count: 1, window_start: new Date().toISOString() }).eq("ip", ip);
      }
    } else {
      await supabase.from("scan_rate_limits").insert({ ip, scan_count: 1, window_start: new Date().toISOString() });
    }

    // ── Fetch all platforms in parallel ──
    const providedPlatforms: string[] = [];
    const fetchers: Promise<[string, PlatformResult]>[] = [];

    if (igHandle) { providedPlatforms.push("instagram"); fetchers.push(fetchInstagram(igHandle).then(r => ["instagram", r])); }
    if (ytHandle) { providedPlatforms.push("youtube"); fetchers.push(fetchYouTube(ytHandle).then(r => ["youtube", r])); }
    if (fbHandle) { providedPlatforms.push("facebook"); fetchers.push(fetchFacebook(fbHandle).then(r => ["facebook", r])); }
    if (ttHandle) { providedPlatforms.push("tiktok"); fetchers.push(fetchTikTok(ttHandle).then(r => ["tiktok", r])); }

    const results = await Promise.allSettled(fetchers);
    const platformData: Record<string, PlatformResult> = {};

    for (const r of results) {
      if (r.status === "fulfilled") {
        const [key, data] = r.value;
        platformData[key] = data;
      }
    }

    // Fill missing
    for (const key of ["instagram", "youtube", "facebook", "tiktok"]) {
      if (!platformData[key]) {
        platformData[key] = {
          available: false,
          error: providedPlatforms.includes(key) ? "Fetch failed" : "Not provided",
          followers: 0,
          posts: [],
        };
      }
    }

    // ── Compute Score ──
    const { overall, subScores, dimensions } = computeScores(platformData, providedPlatforms);
    const insightText = generateInsight(overall, subScores);
    const recommendations = generateRecommendations(subScores, platformData);

    // ── Build posts array ──
    const allPosts: PostData[] = [];
    for (const p of Object.values(platformData)) {
      if (p.available) allPosts.push(...p.posts);
    }
    allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const topPosts = allPosts.slice(0, 20);

    // ── Persist if user_id ──
    if (userId) {
      try {
        await supabase.from("scores").insert({
          user_id: userId,
          overall,
          sub_scores: subScores,
          data_source: "real_time_scrape",
          ai_summary: insightText,
          ai_recommendations: recommendations,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          period_end: new Date().toISOString().split("T")[0],
        });

        if (topPosts.length > 0) {
          const postRows = topPosts.map(p => ({
            user_id: userId,
            platform: p.platform,
            content_type: p.type as any,
            content_snippet: p.content,
            published_at: p.date,
            external_id: p.external_id,
            metrics: { likes: p.likes, comments: p.comments, views: p.views, engagement_rate: p.engagement_rate },
          }));
          await supabase.from("posts").upsert(postRows, { onConflict: "user_id,platform,external_id", ignoreDuplicates: true });
        }

        await supabase.from("profiles").update({ last_scan_at: new Date().toISOString() }).eq("id", userId);
      } catch (persistErr) {
        console.error("Persistence error (non-fatal):", persistErr);
      }
    }

    // ── Build platform summary ──
    const platformsSummary: any = {};
    for (const key of ["instagram", "youtube", "facebook", "tiktok"]) {
      const p = platformData[key];
      platformsSummary[key] = {
        available: p.available,
        ...(p.available
          ? { followers: p.followers, posts_analyzed: p.posts.length, collecting: p.collecting || false }
          : { error: p.error || "Not available" }),
      };
    }

    return new Response(JSON.stringify({
      success: true,
      score: {
        overall,
        sub_scores: subScores,
        dimensions,
        platforms: platformsSummary,
        posts: topPosts,
        ai_insight: insightText,
        ai_recommendations: recommendations,
        data_source: "real_time_scrape",
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("scan-profile error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

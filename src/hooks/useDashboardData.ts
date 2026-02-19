import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { type ScoreDimension, type ContentPost, type CompetitorData } from "@/data/mockScoreData";

// --- useLatestScore ---
export function useLatestScore() {
  const { user } = useAuth();
  const { data: score, isLoading, error } = useQuery({
    queryKey: ["latestScore", user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  return { score, isLoading, error };
}

// --- usePreviousScore ---
export function usePreviousScore() {
  const { user } = useAuth();
  const { data: previousScore } = useQuery({
    queryKey: ["previousScore", user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("overall, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .range(1, 1);
      if (error) throw error;
      return data?.[0]?.overall ?? null;
    },
  });
  return previousScore;
}

// --- useScoreHistory ---
export function useScoreHistory() {
  const { user } = useAuth();
  const { data: scoreHistory } = useQuery({
    queryKey: ["scoreHistory", user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("overall, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      if (!data) return [];
      return data
        .map((row) => ({
          month: new Date(row.created_at).toLocaleDateString("en-US", { month: "short" }),
          score: row.overall,
        }))
        .reverse();
    },
  });
  return scoreHistory ?? [];
}

// --- useUserPosts ---
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mapContentType(ct: string | null): "Reel" | "Post" | "Video" | "Story" | "Short" | "Carousel" {
  switch (ct) {
    case "reel": return "Reel";
    case "video": return "Video";
    case "carousel": return "Carousel";
    case "story": return "Story";
    case "short": return "Short";
    case "image":
    default: return "Post";
  }
}

export function useUserPosts() {
  const { user } = useAuth();
  const { data: posts } = useQuery({
    queryKey: ["userPosts", user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("published_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      if (!data) return [];
      return data.map((row): ContentPost => {
        const metrics = (row.metrics as Record<string, number> | null) ?? {};
        return {
          id: row.id,
          platform: capitalize(row.platform) as ContentPost["platform"],
          type: mapContentType(row.content_type),
          content: row.content_snippet || "",
          engagementRate: metrics.engagement_rate || 0,
          reach: metrics.views || metrics.likes || 0,
          date: row.published_at || row.created_at,
        };
      });
    },
  });
  return posts ?? [];
}

// --- useUserCompetitors ---
export function useUserCompetitors() {
  const { user } = useAuth();
  const { data: competitors } = useQuery({
    queryKey: ["userCompetitors", user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_competitors")
        .select("*, competitor_profiles(*)")
        .eq("user_id", user!.id)
        .eq("confirmed", true);
      if (error) throw error;
      if (!data) return [];
      return data.map((row): CompetitorData => {
        const cp = row.competitor_profiles as any;
        const scanData = cp?.scan_data as Record<string, any> | null;
        return {
          name: cp?.display_name || cp?.handle || "Unknown",
          score: scanData?.score || 0,
          change: scanData?.change || 0,
          source: row.source,
        };
      });
    },
  });
  return competitors ?? [];
}

// --- dimensionsFromSubScores ---
const defaultDimensions: ScoreDimension[] = [
  { name: "Velocity", key: "velocity", weight: 25, score: 0, maxScore: 100, description: "Posting frequency & consistency across platforms" },
  { name: "Video Dominance", key: "video", weight: 20, score: 0, maxScore: 100, description: "Ratio of video content to static posts" },
  { name: "Engagement", key: "engagement", weight: 20, score: 0, maxScore: 100, description: "Estimated engagement rate vs. industry average" },
  { name: "Competitor Gap", key: "competitor", weight: 15, score: 0, maxScore: 100, description: "How your velocity compares to tracked competitors" },
  { name: "Coverage", key: "coverage", weight: 10, score: 0, maxScore: 100, description: "Number of active platforms with recent content" },
  { name: "Recency", key: "recency", weight: 10, score: 0, maxScore: 100, description: "How recent your latest content is" },
];

export function dimensionsFromSubScores(subScores: Record<string, number | null> | null): ScoreDimension[] {
  if (!subScores) return defaultDimensions;
  return [
    { name: "Velocity", key: "velocity", weight: 25, score: subScores.velocity ?? 0, maxScore: 100, description: "Posting frequency & consistency across platforms" },
    { name: "Video Dominance", key: "video", weight: 20, score: subScores.video ?? 0, maxScore: 100, description: "Ratio of video content to static posts" },
    { name: "Engagement", key: "engagement", weight: 20, score: subScores.engagement ?? 0, maxScore: 100, description: "Estimated engagement rate vs. industry average" },
    { name: "Competitor Gap", key: "competitor", weight: 15, score: subScores.competitor ?? 0, maxScore: 100, description: "How your velocity compares to tracked competitors" },
    { name: "Coverage", key: "coverage", weight: 10, score: subScores.coverage ?? 0, maxScore: 100, description: "Number of active platforms with recent content" },
    { name: "Recency", key: "recency", weight: 10, score: subScores.recency ?? 0, maxScore: 100, description: "How recent your latest content is" },
  ];
}

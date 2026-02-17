export interface ScoreDimension {
  name: string;
  key: string;
  weight: number;
  score: number;
  maxScore: number;
  description: string;
}

export interface ContentPost {
  id: string;
  platform: "Instagram" | "TikTok" | "YouTube" | "Facebook";
  type: "Reel" | "Post" | "Story" | "Video" | "Short" | "Carousel";
  content: string;
  engagementRate: number;
  reach: number;
  date: string;
}

export interface CompetitorData {
  name: string;
  score: number;
  change: number;
  source: "ai_suggested" | "manual";
}

export const mockUserScore = {
  overall: 64,
  tier: "Visible" as const,
  change: +5,
  lastUpdated: "2026-02-16",
};

export const mockDimensions: ScoreDimension[] = [
  { name: "Velocity", key: "velocity", weight: 25, score: 72, maxScore: 100, description: "Posting frequency & consistency across platforms" },
  { name: "Video Dominance", key: "video", weight: 20, score: 58, maxScore: 100, description: "Ratio of video content to static posts" },
  { name: "Engagement", key: "engagement", weight: 20, score: 69, maxScore: 100, description: "Estimated engagement rate vs. industry average" },
  { name: "Competitor Gap", key: "competitor", weight: 15, score: 55, maxScore: 100, description: "How your velocity compares to top competitors" },
  { name: "Coverage", key: "coverage", weight: 10, score: 80, maxScore: 100, description: "Number of active platforms" },
  { name: "Recency", key: "recency", weight: 10, score: 45, maxScore: 100, description: "How recent your latest content is" },
];

export const mockContentPosts: ContentPost[] = [
  { id: "p1", platform: "Instagram", type: "Reel", content: "Behind the scenes of our new product launch 🚀", engagementRate: 5.2, reach: 12400, date: "2026-02-15" },
  { id: "p2", platform: "TikTok", type: "Video", content: "5 tips for better brand visibility", engagementRate: 7.8, reach: 34200, date: "2026-02-14" },
  { id: "p4", platform: "Instagram", type: "Carousel", content: "Top 10 social media trends for 2026", engagementRate: 4.6, reach: 8900, date: "2026-02-12" },
  { id: "p5", platform: "YouTube", type: "Video", content: "Full visibility audit walkthrough", engagementRate: 2.9, reach: 6100, date: "2026-02-10" },
  { id: "p6", platform: "Instagram", type: "Story", content: "Q&A with our founder", engagementRate: 6.4, reach: 9200, date: "2026-02-09" },
];

export const mockCompetitors: CompetitorData[] = [
  { name: "Competitor A", score: 78, change: +3, source: "ai_suggested" },
  { name: "Competitor B", score: 61, change: -2, source: "manual" },
  { name: "Competitor C", score: 55, change: +1, source: "ai_suggested" },
  { name: "Competitor D", score: 42, change: -5, source: "manual" },
];

export const mockScoreHistory = [
  { month: "Sep", score: 41 },
  { month: "Oct", score: 48 },
  { month: "Nov", score: 52 },
  { month: "Dec", score: 55 },
  { month: "Jan", score: 59 },
  { month: "Feb", score: 64 },
];

export function getScoreColor(score: number): string {
  if (score < 20) return "hsl(var(--score-invisible))";
  if (score < 40) return "hsl(var(--score-low))";
  if (score < 60) return "hsl(var(--score-fading))";
  if (score < 80) return "hsl(var(--score-visible))";
  return "hsl(var(--score-highly-visible))";
}

export function getScoreTier(score: number): string {
  if (score < 20) return "Invisible";
  if (score < 40) return "Low Visibility";
  if (score < 60) return "Fading";
  if (score < 80) return "Visible";
  return "Highly Visible";
}

export function getScoreColorClass(score: number): string {
  if (score < 20) return "text-score-invisible";
  if (score < 40) return "text-score-low";
  if (score < 60) return "text-score-fading";
  if (score < 80) return "text-score-visible";
  return "text-score-highly-visible";
}

export function getScoreBgClass(score: number): string {
  if (score < 20) return "bg-score-invisible";
  if (score < 40) return "bg-score-low";
  if (score < 60) return "bg-score-fading";
  if (score < 80) return "bg-score-visible";
  return "bg-score-highly-visible";
}

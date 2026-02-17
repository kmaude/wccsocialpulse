// ─── USERS TAB ───
export type ScoreTrend = "up" | "down" | "flat";

export interface AdminUser {
  id: string;
  name: string;
  businessName: string;
  vertical: "CPG" | "Local Services" | "Other";
  planTier: "free" | "premium";
  currentScore: number;
  scoreTrend: ScoreTrend;
  lastLogin: string;
  email: string;
  dashboardVisits30d: number;
  clickedWccCta: boolean;
  consecutiveDeclines: number;
  competitorGapWidening: boolean;
}

// ─── LEAD SIGNALS TAB ───
export type DistressSignal =
  | "Premium Subscriber"
  | "Score Below 50"
  | "Declining 2+ Periods"
  | "Competitor Gap Widening"
  | "High Dashboard Activity"
  | "Clicked WCC CTA"
  | "Vertical w/ Case Studies";

export interface LeadSignalUser extends AdminUser {
  leadScore: number;
  distressSignals: DistressSignal[];
  lastActive: string;
}

function computeLeadScore(u: AdminUser): { score: number; signals: DistressSignal[] } {
  let score = 0;
  const signals: DistressSignal[] = [];
  if (u.planTier === "premium") { score += 30; signals.push("Premium Subscriber"); }
  if (u.currentScore < 50) { score += 25; signals.push("Score Below 50"); }
  if (u.consecutiveDeclines >= 2) { score += 25; signals.push("Declining 2+ Periods"); }
  if (u.competitorGapWidening) { score += 20; signals.push("Competitor Gap Widening"); }
  if (u.dashboardVisits30d >= 5) { score += 20; signals.push("High Dashboard Activity"); }
  if (u.clickedWccCta) { score += 20; signals.push("Clicked WCC CTA"); }
  if (u.vertical === "CPG" || u.vertical === "Local Services") { score += 10; signals.push("Vertical w/ Case Studies"); }
  return { score, signals };
}

export const mockAdminUsers: AdminUser[] = [
  { id: "u1", name: "Sarah Chen", businessName: "Glow Naturals", vertical: "CPG", planTier: "premium", currentScore: 38, scoreTrend: "down", lastLogin: "2026-02-17T09:15:00Z", email: "sarah@glownaturals.com", dashboardVisits30d: 12, clickedWccCta: true, consecutiveDeclines: 3, competitorGapWidening: true },
  { id: "u2", name: "Marcus Rivera", businessName: "Rivera Plumbing", vertical: "Local Services", planTier: "free", currentScore: 42, scoreTrend: "down", lastLogin: "2026-02-16T14:30:00Z", email: "marcus@riveraplumbing.com", dashboardVisits30d: 8, clickedWccCta: false, consecutiveDeclines: 2, competitorGapWidening: true },
  { id: "u3", name: "Aisha Patel", businessName: "Patel & Co Consulting", vertical: "Other", planTier: "free", currentScore: 55, scoreTrend: "flat", lastLogin: "2026-02-15T11:00:00Z", email: "aisha@patelandco.com", dashboardVisits30d: 3, clickedWccCta: false, consecutiveDeclines: 0, competitorGapWidening: false },
  { id: "u4", name: "Jake Thompson", businessName: "Fresh Bites Snacks", vertical: "CPG", planTier: "premium", currentScore: 71, scoreTrend: "up", lastLogin: "2026-02-17T08:00:00Z", email: "jake@freshbites.com", dashboardVisits30d: 6, clickedWccCta: false, consecutiveDeclines: 0, competitorGapWidening: false },
  { id: "u5", name: "Lina Müller", businessName: "Clean Home Pro", vertical: "Local Services", planTier: "premium", currentScore: 29, scoreTrend: "down", lastLogin: "2026-02-14T16:45:00Z", email: "lina@cleanhomepro.com", dashboardVisits30d: 15, clickedWccCta: true, consecutiveDeclines: 4, competitorGapWidening: true },
  { id: "u6", name: "David Kim", businessName: "Kimchi Kitchen", vertical: "CPG", planTier: "free", currentScore: 63, scoreTrend: "up", lastLogin: "2026-02-16T10:20:00Z", email: "david@kimchikitchen.com", dashboardVisits30d: 2, clickedWccCta: false, consecutiveDeclines: 0, competitorGapWidening: false },
  { id: "u7", name: "Emily Foster", businessName: "Foster Fitness", vertical: "Other", planTier: "free", currentScore: 47, scoreTrend: "down", lastLogin: "2026-02-13T09:00:00Z", email: "emily@fosterfitness.com", dashboardVisits30d: 7, clickedWccCta: true, consecutiveDeclines: 2, competitorGapWidening: false },
  { id: "u8", name: "Carlos Mendez", businessName: "Mendez Auto Detail", vertical: "Local Services", planTier: "free", currentScore: 34, scoreTrend: "down", lastLogin: "2026-02-12T13:30:00Z", email: "carlos@mendezauto.com", dashboardVisits30d: 1, clickedWccCta: false, consecutiveDeclines: 3, competitorGapWidening: true },
  { id: "u9", name: "Tanya Brooks", businessName: "Bloom Beauty Co", vertical: "CPG", planTier: "premium", currentScore: 82, scoreTrend: "up", lastLogin: "2026-02-17T07:45:00Z", email: "tanya@bloombeauty.com", dashboardVisits30d: 4, clickedWccCta: false, consecutiveDeclines: 0, competitorGapWidening: false },
  { id: "u10", name: "Ryan O'Brien", businessName: "O'Brien Landscaping", vertical: "Local Services", planTier: "premium", currentScore: 44, scoreTrend: "flat", lastLogin: "2026-02-15T15:00:00Z", email: "ryan@obrienlandscaping.com", dashboardVisits30d: 6, clickedWccCta: true, consecutiveDeclines: 1, competitorGapWidening: true },
];

export const mockLeadSignalUsers: LeadSignalUser[] = mockAdminUsers
  .map((u) => {
    const { score, signals } = computeLeadScore(u);
    return { ...u, leadScore: score, distressSignals: signals, lastActive: u.lastLogin };
  })
  .sort((a, b) => b.leadScore - a.leadScore);

// ─── BENCHMARKS TAB ───
export interface BenchmarkRow {
  metric: string;
  vertical: "CPG" | "Local Services" | "Other";
  p25: number;
  p50: number;
  p75: number;
  sampleSize: number;
  lastUpdated: string;
}

export const mockBenchmarks: BenchmarkRow[] = [
  { metric: "Visibility Score", vertical: "CPG", p25: 38, p50: 52, p75: 71, sampleSize: 240, lastUpdated: "2026-02-01" },
  { metric: "Visibility Score", vertical: "Local Services", p25: 30, p50: 45, p75: 62, sampleSize: 180, lastUpdated: "2026-02-01" },
  { metric: "Visibility Score", vertical: "Other", p25: 25, p50: 40, p75: 58, sampleSize: 12, lastUpdated: "2026-02-01" },
  { metric: "Engagement Rate (%)", vertical: "CPG", p25: 1.2, p50: 2.8, p75: 4.5, sampleSize: 240, lastUpdated: "2026-02-01" },
  { metric: "Engagement Rate (%)", vertical: "Local Services", p25: 0.9, p50: 2.1, p75: 3.8, sampleSize: 180, lastUpdated: "2026-02-01" },
  { metric: "Engagement Rate (%)", vertical: "Other", p25: 0.8, p50: 1.9, p75: 3.2, sampleSize: 12, lastUpdated: "2026-02-01" },
  { metric: "Posts Per Week", vertical: "CPG", p25: 2, p50: 4, p75: 7, sampleSize: 240, lastUpdated: "2026-02-01" },
  { metric: "Posts Per Week", vertical: "Local Services", p25: 1, p50: 2, p75: 4, sampleSize: 180, lastUpdated: "2026-02-01" },
  { metric: "Posts Per Week", vertical: "Other", p25: 1, p50: 3, p75: 5, sampleSize: 12, lastUpdated: "2026-02-01" },
  { metric: "Follower Growth (%/mo)", vertical: "CPG", p25: 0.5, p50: 1.8, p75: 3.4, sampleSize: 240, lastUpdated: "2026-02-01" },
  { metric: "Follower Growth (%/mo)", vertical: "Local Services", p25: 0.3, p50: 1.2, p75: 2.6, sampleSize: 180, lastUpdated: "2026-02-01" },
  { metric: "Follower Growth (%/mo)", vertical: "Other", p25: 0.2, p50: 0.9, p75: 2.0, sampleSize: 12, lastUpdated: "2026-02-01" },
];

// ─── SYSTEM HEALTH TAB ───
export interface PlatformStatus {
  platform: "Instagram" | "Facebook" | "TikTok" | "YouTube";
  status: "operational" | "degraded" | "down";
  lastChecked: string;
  avgLatencyMs: number;
}

export interface CronJob {
  name: string;
  schedule: string;
  lastRun: string;
  status: "success" | "failed" | "running";
}

export const mockPlatformStatuses: PlatformStatus[] = [
  { platform: "Instagram", status: "operational", lastChecked: "2026-02-17T10:00:00Z", avgLatencyMs: 142 },
  { platform: "Facebook", status: "operational", lastChecked: "2026-02-17T10:00:00Z", avgLatencyMs: 98 },
  { platform: "TikTok", status: "degraded", lastChecked: "2026-02-17T10:00:00Z", avgLatencyMs: 450 },
  { platform: "YouTube", status: "operational", lastChecked: "2026-02-17T10:00:00Z", avgLatencyMs: 110 },
];

export const mockCronJobs: CronJob[] = [
  { name: "Score Computation (Monthly)", schedule: "0 0 1 * *", lastRun: "2026-02-01T00:02:14Z", status: "success" },
  { name: "Score Computation (Weekly - Premium)", schedule: "0 0 * * 1", lastRun: "2026-02-17T00:01:42Z", status: "success" },
  { name: "Competitor Scan", schedule: "0 */6 * * *", lastRun: "2026-02-17T06:00:31Z", status: "success" },
  { name: "Email Digest Send", schedule: "0 9 1 * *", lastRun: "2026-02-01T09:00:05Z", status: "success" },
  { name: "Token Refresh", schedule: "*/30 * * * *", lastRun: "2026-02-17T09:30:12Z", status: "running" },
];

export const mockStripeSummary = {
  mrr: 1_247,
  subscribers: 43,
  churnRate: 4.2,
  activeUsers: 187,
  inactiveUsers: 56,
};

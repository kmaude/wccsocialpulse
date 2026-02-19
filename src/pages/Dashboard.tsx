import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ScoreAlertNudges } from "@/components/dashboard/ScoreAlertNudges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VisibilityScoreGauge } from "@/components/dashboard/VisibilityScoreGauge";
import { DimensionBreakdown } from "@/components/dashboard/DimensionBreakdown";
import { ScoreDisclaimerBanner } from "@/components/dashboard/ScoreDisclaimerBanner";
import { ContentPosts } from "@/components/dashboard/ContentPosts";
import { CompetitorSection } from "@/components/dashboard/CompetitorSection";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { FirstReportCard } from "@/components/dashboard/FirstReportCard";
import { MonthlyReportPreview } from "@/components/dashboard/MonthlyReportPreview";
import { PremiumComparisonTable } from "@/components/dashboard/PremiumComparisonTable";
import { SetPasswordCard } from "@/components/dashboard/SetPasswordCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  useLatestScore, usePreviousScore, useScoreHistory,
  useUserPosts, useUserCompetitors, dimensionsFromSubScores,
} from "@/hooks/useDashboardData";
import { getScoreBgClass, getScoreTier } from "@/data/mockScoreData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { profile, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const planTier = profile?.plan_tier ?? "free";
  const hasOAuthConnected = false;

  const { score: latestScore, isLoading: scoreLoading } = useLatestScore();
  const previousScore = usePreviousScore();
  const scoreHistory = useScoreHistory();
  const posts = useUserPosts();
  const competitors = useUserCompetitors();

  const overall = latestScore?.overall ?? 0;
  const change = previousScore != null ? overall - previousScore : 0;
  const subScores = latestScore?.sub_scores as Record<string, number | null> | null;
  const dimensions = dimensionsFromSubScores(subScores);
  const lastUpdated = latestScore?.created_at ?? new Date().toISOString();

  useEffect(() => {
    checkSubscription();
    if (searchParams.get("upgrade") === "success") {
      toast({ title: "Welcome to Premium! 🎉", description: "Your subscription is now active." });
      setSearchParams({});
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold">Your Visibility Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* First Report Card (new users with no score) */}
        {planTier === "free" && !latestScore && !scoreLoading && (
          <FirstReportCard signupDate={new Date().toISOString()} />
        )}

        {/* Disclaimer Banner */}
        <ScoreDisclaimerBanner planTier={planTier} hasOAuthConnected={hasOAuthConnected} />

        {/* Score-Based Urgency Alerts */}
        <ScoreAlertNudges score={overall} scoreHistory={scoreHistory} />

        {/* Top Row: Score + Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-glow border-primary/10">
            <CardContent className="flex flex-col items-center py-8 space-y-4">
              {scoreLoading ? (
                <Skeleton className="h-32 w-32 rounded-full" />
              ) : (
                <VisibilityScoreGauge score={overall} />
              )}
              <div className="text-center">
                <Badge className={`${getScoreBgClass(overall)} text-primary-foreground border-0 text-sm px-3 py-1`}>
                  {getScoreTier(overall)}
                </Badge>
                {latestScore && (
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    {change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-score-visible" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`text-sm font-medium ${change >= 0 ? "text-score-visible" : "text-destructive"}`}>
                      {change >= 0 ? "+" : ""}{change} pts since last scan
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-lg">Score Breakdown</CardTitle>
              <CardDescription>Your visibility measured across 6 dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <DimensionBreakdown dimensions={dimensions} />
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Score History + Competitors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Score Trend</CardTitle>
              <CardDescription>Your visibility over recent scans</CardDescription>
            </CardHeader>
            <CardContent>
              {scoreHistory.length > 1 ? (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Score trend will appear after your second scan.
                </p>
              )}
            </CardContent>
          </Card>

          <CompetitorSection
            userScore={overall}
            competitors={competitors}
            planTier={planTier}
          />
        </div>

        {/* Content Performance */}
        <ContentPosts posts={posts} planTier={planTier} />

        {/* AI Recommendations */}
        <AIRecommendations />

        {/* Monthly Report Preview & Premium Comparison (Free users) */}
        {planTier === "free" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyReportPreview
              score={overall}
              scoreChange={change}
              dimensions={dimensions}
              signupDate={new Date().toISOString()}
            />
            <PremiumComparisonTable />
          </div>
        )}

        {/* Optional password creation */}
        <SetPasswordCard />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

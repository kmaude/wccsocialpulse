import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ScoreAlertNudges } from "@/components/dashboard/ScoreAlertNudges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { supabase } from "@/integrations/supabase/client";
import {
  useLatestScore, usePreviousScore, useScoreHistory,
  useUserPosts, useUserCompetitors, dimensionsFromSubScores,
} from "@/hooks/useDashboardData";
import { getScoreTier, getScoreBgClass } from "@/data/mockScoreData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { profile, session, checkSubscription } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const planTier = profile?.plan_tier ?? "free";
  const hasOAuthConnected = false;

  const { score: latestScore, isLoading: scoreLoading } = useLatestScore();
  const previousScore = usePreviousScore();
  const scoreHistory = useScoreHistory();
  const posts = useUserPosts();
  const competitors = useUserCompetitors();

  const overallScore = latestScore?.overall ?? 0;
  const scoreChange = previousScore != null ? overallScore - previousScore : 0;
  const dimensions = dimensionsFromSubScores(latestScore?.sub_scores as Record<string, number | null> | null);
  const aiRecommendations = (latestScore?.ai_recommendations as string[] | null) ?? [];

  useEffect(() => {
    checkSubscription();
    if (searchParams.get("upgrade") === "success") {
      toast({ title: "Welcome to Premium! 🎉", description: "Your subscription is now active." });
      setSearchParams({});
    }
  }, []);

  const handleRefresh = async () => {
    if (!profile) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-profile", {
        body: {
        instagram: profile.instagram_handle || null,
          facebook: profile.facebook_handle || null,
          youtube: profile.youtube_handle || null,
          tiktok: profile.tiktok_handle || null,
          user_id: session?.user?.id,
        },
      });
      if (error) throw error;
      if (data?.success) {
        toast({ title: "Score updated!", description: `Your new Visibility Score is ${data.score.overall}/100.` });
        queryClient.invalidateQueries({ queryKey: ["latestScore"] });
        queryClient.invalidateQueries({ queryKey: ["previousScore"] });
        queryClient.invalidateQueries({ queryKey: ["scoreHistory"] });
        queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      } else {
        throw new Error(data?.error || "Scan failed");
      }
    } catch (err: any) {
      toast({ title: "Refresh failed", description: err.message || "Please try again later.", variant: "destructive" });
    }
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {scoreLoading ? (
          <div className="space-y-6 py-12">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-48 w-full" />
            <p className="text-sm text-muted-foreground">Loading your visibility report...</p>
          </div>
        ) : !latestScore ? (
          <div className="text-center py-16 space-y-4">
            <h2 className="font-display text-2xl font-bold">Welcome to Social Pulse!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't run a scan yet. Get your first Visibility Score to see your report.
            </p>
            <Button asChild size="lg">
              <Link to="/">Run Your First Scan</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold">Your Visibility Report</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date(latestScore.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Scanning..." : "Refresh Score"}
              </Button>
            </div>

            {/* First Report Card (new free users) */}
            {planTier === "free" && (
              <FirstReportCard signupDate={new Date().toISOString()} />
            )}

            {/* Disclaimer Banner */}
            <ScoreDisclaimerBanner planTier={planTier} hasOAuthConnected={hasOAuthConnected} />

            {/* Score-Based Urgency Alerts */}
            <ScoreAlertNudges score={overallScore} scoreHistory={scoreHistory} />

            {/* Top Row: Score + Dimensions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 shadow-glow border-primary/10">
                <CardContent className="flex flex-col items-center py-8 space-y-4">
                  <VisibilityScoreGauge score={overallScore} />
                  <div className="text-center">
                    <Badge className={`${getScoreBgClass(overallScore)} text-primary-foreground border-0 text-sm px-3 py-1`}>
                      {getScoreTier(overallScore)}
                    </Badge>
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      {scoreChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-score-visible" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <span className={`text-sm font-medium ${scoreChange >= 0 ? "text-score-visible" : "text-destructive"}`}>
                        {scoreChange >= 0 ? "+" : ""}{scoreChange} pts since last scan
                      </span>
                    </div>
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
                userScore={overallScore}
                competitors={competitors}
                planTier={planTier}
              />
            </div>

            {/* Content Performance */}
            <ContentPosts posts={posts} planTier={planTier} />

            {/* AI Recommendations */}
            <AIRecommendations recommendations={aiRecommendations} />

            {/* Monthly Report Preview & Premium Comparison (Free users) */}
            {planTier === "free" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlyReportPreview
                  score={overallScore}
                  scoreChange={scoreChange}
                  dimensions={dimensions}
                  signupDate={new Date().toISOString()}
                />
                <PremiumComparisonTable />
              </div>
            )}

            {/* Optional password creation */}
            <SetPasswordCard />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

import { TrendingUp, TrendingDown } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import {
  mockUserScore, mockDimensions, mockContentPosts, mockCompetitors,
  mockScoreHistory, getScoreColor, getScoreTier, getScoreBgClass,
} from "@/data/mockScoreData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { profile } = useAuth();
  const planTier = profile?.plan_tier ?? "free";
  // Mock: no OAuth connected for now
  const hasOAuthConnected = false;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold">Your Visibility Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(mockUserScore.lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Disclaimer Banner */}
        <ScoreDisclaimerBanner planTier={planTier} hasOAuthConnected={hasOAuthConnected} />

        {/* Top Row: Score + Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-glow border-primary/10">
            <CardContent className="flex flex-col items-center py-8 space-y-4">
              <VisibilityScoreGauge score={mockUserScore.overall} />
              <div className="text-center">
                <Badge className={`${getScoreBgClass(mockUserScore.overall)} text-primary-foreground border-0 text-sm px-3 py-1`}>
                  {getScoreTier(mockUserScore.overall)}
                </Badge>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {mockUserScore.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-score-visible" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ${mockUserScore.change > 0 ? "text-score-visible" : "text-destructive"}`}>
                    {mockUserScore.change > 0 ? "+" : ""}{mockUserScore.change} pts this month
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
              <DimensionBreakdown dimensions={mockDimensions} />
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Score History + Competitors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Score Trend</CardTitle>
              <CardDescription>Your visibility over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockScoreHistory}>
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
            </CardContent>
          </Card>

          <CompetitorSection
            userScore={mockUserScore.overall}
            competitors={mockCompetitors}
            planTier={planTier}
          />
        </div>

        {/* Content Performance */}
        <ContentPosts posts={mockContentPosts} planTier={planTier} />

        {/* AI Recommendations */}
        <AIRecommendations />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

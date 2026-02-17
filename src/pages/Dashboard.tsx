import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VisibilityScoreGauge } from "@/components/dashboard/VisibilityScoreGauge";
import { DimensionBreakdown } from "@/components/dashboard/DimensionBreakdown";
import {
  mockUserScore, mockDimensions, mockContentPosts, mockCompetitors,
  mockScoreHistory, getScoreColor, getScoreTier, getScoreColorClass, getScoreBgClass,
} from "@/data/mockScoreData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸", TikTok: "🎵", YouTube: "▶️", LinkedIn: "💼", Facebook: "📘",
};

const Dashboard = () => {
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

        {/* Top Row: Score + Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Card */}
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

          {/* Dimensions */}
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
          {/* Score History */}
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

          {/* Competitor Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Competitor Landscape</CardTitle>
              <CardDescription>How you compare to tracked competitors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold">
                  Y
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">You</span>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(mockUserScore.overall) }}>
                      {mockUserScore.overall}
                    </span>
                  </div>
                  <Progress value={mockUserScore.overall} className="h-1.5 mt-1" />
                </div>
              </div>

              {mockCompetitors.map((c) => (
                <div key={c.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                    {c.name.charAt(c.name.length - 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${c.change > 0 ? "text-score-visible" : "text-destructive"}`}>
                          {c.change > 0 ? "+" : ""}{c.change}
                        </span>
                        <span className="text-sm font-bold" style={{ color: getScoreColor(c.score) }}>
                          {c.score}
                        </span>
                      </div>
                    </div>
                    <Progress value={c.score} className="h-1.5 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Content Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Top Content</CardTitle>
            <CardDescription>Your best-performing recent posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockContentPosts.map((post) => (
                <Card key={post.id} className="border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{PLATFORM_ICONS[post.platform]}</span>
                        <Badge variant="outline" className="text-[10px]">{post.type}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Engagement: <strong className="text-foreground">{post.engagementRate}%</strong>
                      </span>
                      <span>
                        Reach: <strong className="text-foreground">{post.reach.toLocaleString()}</strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations CTA */}
        <Card className="bg-gradient-hero-subtle border-primary/10">
          <CardContent className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold">Get AI-Powered Recommendations</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Claude analyzes your visibility data and generates actionable steps to improve your score.
              </p>
            </div>
            <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90 shrink-0">
              Generate Insights <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

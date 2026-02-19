import { Link } from "react-router-dom";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VisibilityScoreGauge } from "@/components/dashboard/VisibilityScoreGauge";
import { getScoreTier, getScoreColor } from "@/data/mockScoreData";

interface ScanResultsCardProps {
  score: number;
  scanData: any;
  session: any;
  onEmailCapture: () => void;
}

const DIMENSIONS = [
  { key: "velocity", label: "Velocity", locked: false },
  { key: "recency", label: "Recency", locked: false },
  { key: "video", label: "Video Dominance", locked: true },
  { key: "engagement", label: "Engagement Estimate", locked: true },
  { key: "competitor", label: "Competitor Velocity Gap", locked: true },
  { key: "coverage", label: "Coverage", locked: true },
] as const;

function getAIInsight(overall: number, velocity: number, recency: number): string {
  if (recency < 40)
    return "Your most recent post is over 2 weeks old. Algorithms penalize inactivity — every day without a post is visibility lost to competitors.";
  if (velocity < 50)
    return "You're publishing less frequently than most brands in your space. Increasing your posting cadence is the fastest way to boost your score.";
  if (overall < 40)
    return "Your brand is currently in the 'Low Visibility' range. Your competitors are capturing the audience attention you're missing.";
  if (overall < 60)
    return "You're in the 'Fading' zone — you have a foundation but significant gaps are letting competitors pull ahead.";
  return "Your visibility is solid but there's room to grow. See your full breakdown to find exactly where to focus.";
}

function getPercentile(score: number): number {
  const raw = 100 - score;
  const rounded = Math.round(raw / 5) * 5;
  return Math.min(rounded, 95);
}

export function ScanResultsCard({ score, scanData, session, onEmailCapture }: ScanResultsCardProps) {
  const subs = scanData?.sub_scores || { velocity: 0, recency: 0, video: 0, engagement: 0, competitor: 0, coverage: 0 };
  const percentile = getPercentile(score);
  const insight = scanData?.ai_insight || getAIInsight(score, subs.velocity, subs.recency);
  const scoreColor = getScoreColor(score);

  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card className="shadow-glow border-primary/10 overflow-hidden">
        <CardContent className="pt-8 pb-6 space-y-6">
          {/* 1A: Score + Tier + Percentile */}
          <div className="text-center space-y-3">
            <VisibilityScoreGauge score={score} size={150} />
            <Badge
              className="border-0 text-sm font-semibold px-3 py-1"
              style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}
            >
              {getScoreTier(score)}
            </Badge>
            <p className="text-sm text-muted-foreground">
              You're less visible than ~{percentile}% of brands in your space.
            </p>
            {scanData?.platforms && (
              <div className="flex items-center justify-center gap-2 mt-2">
                {Object.entries(scanData.platforms).map(([platform, info]: [string, any]) => (
                  info.available ? (
                    <Badge key={platform} variant="outline" className="text-xs capitalize gap-1 border-green-500/30 text-green-600">
                      ✓ {platform}
                    </Badge>
                  ) : info.error !== "Not provided" ? (
                    <Badge key={platform} variant="outline" className="text-xs capitalize gap-1 border-destructive/30 text-destructive">
                      ✗ {platform}
                    </Badge>
                  ) : null
                ))}
              </div>
            )}
          </div>

          {/* 1B: Mini Dimension Bars */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dimension Breakdown
            </p>
            {DIMENSIONS.map((dim) => {
              const value = subs[dim.key] ?? 0;
              const barColor = dim.locked ? "hsl(var(--muted-foreground))" : getScoreColor(value);
              return (
                <div key={dim.key} className="relative">
                  {dim.locked && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[6px] rounded-md bg-background/40">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium w-[140px] shrink-0 truncate">
                      {dim.label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${value}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold w-7 text-right"
                      style={{ color: dim.locked ? "hsl(var(--muted-foreground))" : barColor }}
                    >
                      {value}
                    </span>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-primary font-medium pt-1">
              🔓 Unlock all 6 dimensions — free with email
            </p>
          </div>

          {/* 1C: AI Insight Teaser */}
          <div className="rounded-lg border border-primary/10 bg-accent/50 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">AI Insight · 1 of 3</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">⚡ {insight}</p>
          </div>

          {/* 1D: CTA */}
          <div className="text-center space-y-2 pt-1">
            {session ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90 w-full">
                  View Full Report <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  onClick={onEmailCapture}
                  className="bg-gradient-hero text-primary-foreground hover:opacity-90 w-full"
                >
                  Get My Full Visibility Report — Free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  See all 6 dimensions, your top & bottom posts, competitor comparison, and 3 AI recommendations. No credit card required.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

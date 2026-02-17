import { Mail, Lock, Sparkles, ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getScoreColor } from "@/data/mockScoreData";
import { type ScoreDimension } from "@/data/mockScoreData";

interface MonthlyReportPreviewProps {
  score: number;
  scoreChange: number;
  dimensions: ScoreDimension[];
  signupDate: string;
}

export function MonthlyReportPreview({ score, scoreChange, dimensions, signupDate }: MonthlyReportPreviewProps) {
  const reportDate = new Date(signupDate);
  reportDate.setDate(reportDate.getDate() + 30);
  const formattedDate = reportDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle className="font-display text-lg">Your Monthly Visibility Report</CardTitle>
        </div>
        <CardDescription>Preview of what lands in your inbox every month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Header — VISIBLE */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Score Header</p>
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-bold" style={{ color: getScoreColor(score) }}>
              {score}/100
            </span>
            <span className="text-sm font-medium text-score-visible">
              ↑ {scoreChange} pts from last month
            </span>
          </div>
        </div>

        {/* 6-Dimension Breakdown — VISIBLE */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">6-Dimension Breakdown</p>
          {dimensions.slice(0, 4).map((dim) => (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="text-xs w-[100px] truncate">{dim.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${dim.score}%`, backgroundColor: getScoreColor(dim.score) }}
                />
              </div>
              <span className="text-xs font-semibold w-6 text-right">{dim.score}</span>
            </div>
          ))}
        </div>

        {/* Best & Worst Post — LOCKED */}
        <div className="relative rounded-lg border bg-muted/30 p-4">
          <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[6px] rounded-lg bg-background/40">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="text-xs font-semibold">Included in your report</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Best & Worst Post</p>
          <div className="space-y-2 opacity-50">
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>

        {/* Competitor Pulse — LOCKED */}
        <div className="relative rounded-lg border bg-muted/30 p-4">
          <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[6px] rounded-lg bg-background/40">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="text-xs font-semibold">Included in your report</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Competitor Pulse</p>
          <div className="space-y-2 opacity-50">
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>

        {/* AI Quick Win — TEASER */}
        <div className="rounded-lg border border-primary/10 bg-accent/50 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">AI Quick Win</span>
          </div>
          <p className="text-sm text-foreground">
            ⚡ Based on your score, increasing posting frequency by 2x could boost your visibility by…
          </p>
          <p className="text-xs text-muted-foreground mt-1 italic">Full recommendation in your report</p>
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Your first report arrives <span className="font-semibold text-foreground">{formattedDate}</span>
        </p>

        {/* Premium Upsell */}
        <div className="border-t pt-4 space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
            Premium Users Get
          </p>
          <ul className="space-y-1.5">
            {[
              "Weekly reports instead of monthly",
              "3 AI recommendations (not just 1)",
              "Full competitor breakdown",
              "Best & worst posts with AI analysis",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="text-primary">✦</span>
                {item}
              </li>
            ))}
          </ul>
          <Button className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90 mt-2">
            Upgrade to Premium — $29/mo <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

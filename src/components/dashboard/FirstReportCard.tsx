import { BarChart3, Check, Lock, Sparkles, ArrowRight, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getScoreColor, getScoreTier } from "@/data/mockScoreData";

interface FirstReportCardProps {
  signupDate: string;
}

export function FirstReportCard({ signupDate }: FirstReportCardProps) {
  const reportDate = new Date(signupDate);
  reportDate.setDate(reportDate.getDate() + 30);
  const formattedDate = reportDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="border-primary/15 bg-gradient-hero-subtle">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="font-display text-lg">Your First Visibility Report</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your full monthly report is being prepared. It includes:
        </p>
        <ul className="space-y-2">
          {[
            "Score breakdown with month-over-month trends",
            "Your best and worst performing posts",
            "Competitor comparison",
            "One personalized AI quick-win recommendation",
            "Industry insight from our research",
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Mail className="h-4 w-4 text-primary" />
          Arriving in your inbox on {formattedDate}
        </div>

        <div className="rounded-lg border border-primary/10 bg-accent/50 p-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Upgrade to Premium</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Get weekly reports, 10 competitors, full audience insights, and 24-month historical data.
          </p>
          <Button variant="outline" size="sm" className="mt-1">
            See What Premium Includes <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

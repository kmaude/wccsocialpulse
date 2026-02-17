import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_RECOMMENDATIONS = [
  "Increase your Reels posting frequency to at least 3x per week — video content drives 3.2x more engagement in your vertical.",
  "Your last post on Facebook was 12 days ago. Algorithms penalize inactivity — post at least once per week on every active platform.",
  "Your top competitor is outpacing you by 2.3 posts per week. Match their velocity to close the Competitor Gap dimension.",
];

export function AIRecommendations() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-lg">AI Recommendations</CardTitle>
            <CardDescription>Actionable steps to improve your visibility score</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1.5 border-primary/20 text-primary">
            <Sparkles className="h-3 w-3" /> Powered by AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_RECOMMENDATIONS.map((rec, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {i + 1}
            </div>
            <p className="text-sm leading-relaxed">{rec}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

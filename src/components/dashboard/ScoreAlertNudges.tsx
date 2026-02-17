import { AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ScoreAlertNudgesProps {
  score: number;
  scoreHistory: { month: string; score: number }[];
}

export function ScoreAlertNudges({ score, scoreHistory }: ScoreAlertNudgesProps) {
  // Check for 2+ consecutive months of decline
  const isDeclining =
    scoreHistory.length >= 3 &&
    scoreHistory[scoreHistory.length - 1].score < scoreHistory[scoreHistory.length - 2].score &&
    scoreHistory[scoreHistory.length - 2].score < scoreHistory[scoreHistory.length - 3].score;

  return (
    <div className="space-y-3">
      {/* Score < 40: Red alert */}
      {score < 40 && (
        <Alert className="border-destructive/30 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm flex-1">
              <strong>⚠️ Your brand is currently hard to find.</strong> Competitors are capturing the audience attention you're missing. The longer you wait, the harder it is to recover visibility.
            </span>
            <a href="https://westcoastcontent.com" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0">
                Get a Custom Strategy <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Score 40-59: Amber alert */}
      {score >= 40 && score < 60 && (
        <Alert className="border-score-fading/30 bg-score-fading/5">
          <AlertTriangle className="h-4 w-4 text-score-fading" />
          <AlertDescription className="text-sm">
            <strong>Your visibility is fading.</strong> You have a foundation — but 1-2 key gaps are letting competitors pull ahead. Your monthly report will show you exactly where to focus.
          </AlertDescription>
        </Alert>
      )}

      {/* Declining 2+ months */}
      {isDeclining && (
        <Alert className="border-destructive/30 bg-destructive/5">
          <TrendingDown className="h-4 w-4 text-destructive" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm flex-1">
              <strong>📉 Your score has dropped for 2 consecutive months.</strong> This usually indicates a content strategy gap. Want expert help?
            </span>
            <a href="https://westcoastcontent.com" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0">
                Talk to West Coast Content <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

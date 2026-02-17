import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  planTier: "free" | "premium";
  hasOAuthConnected: boolean;
}

export function ScoreDisclaimerBanner({ planTier, hasOAuthConnected }: Props) {
  // Premium with OAuth = no banner
  if (planTier === "premium" && hasOAuthConnected) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
      <p className="flex-1 text-sm text-muted-foreground">
        Your Visibility Score is estimated based on publicly available data.
        Connect your accounts for a more accurate score based on full platform analytics.
      </p>
      <Button size="sm" variant="outline" className="shrink-0 border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
        Upgrade to Premium <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

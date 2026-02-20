import { useState } from "react";
import { ArrowRight, Check, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const COMPARISON_ROWS = [
  { feature: "Emailed report", free: "Monthly", premium: "Weekly" },
  { feature: "Score + 6 dimensions", free: true, premium: true },
  { feature: "Best & worst posts", free: "Top 3 / Bottom 3", premium: "Top 10 / Bottom 10 with AI analysis" },
  { feature: "Competitor pulse", free: '"Add competitors" CTA', premium: "Full breakdown with velocity gap" },
  { feature: "AI recommendations", free: "1 quick win", premium: "3 detailed action items" },
  { feature: "Audience snapshot", free: "Basic follower count", premium: "Demographics, psychographics, active times" },
  { feature: "Historical data", free: "6 months", premium: "24 months*" },
  { feature: "Platforms", free: "IG + FB + YT (public data)", premium: "All 4 incl. TikTok (full analytics)" },
];

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground mx-auto" />;
  return <span className="text-sm">{value}</span>;
}

export function PremiumComparisonTable() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not start checkout", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Free vs Premium</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3 pr-4">Feature</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-4 text-center">Free</th>
                <th className="text-xs font-semibold text-primary uppercase tracking-wider pb-3 pl-4 text-center">Premium ($29/mo)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 pr-4 text-sm font-medium">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    <CellValue value={row.free} />
                  </td>
                  <td className="py-3 pl-4 text-center">
                    <CellValue value={row.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          * 24-month lookback availability varies by platform. Instagram and Facebook provide up to 2 years of historical data. YouTube provides full channel history. TikTok is forward-looking only — data collection begins from your connection date.
        </p>
        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full mt-6 bg-gradient-hero text-primary-foreground hover:opacity-90"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <>Start Premium — $29/month <ArrowRight className="ml-1 h-4 w-4" /></>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

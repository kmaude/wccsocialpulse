import { useState, useEffect } from "react";
import { Search, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface LeadUser {
  id: string;
  name: string;
  businessName: string;
  vertical: string;
  planTier: string;
  currentScore: number | null;
  leadScore: number;
  distressSignals: string[];
  lastActive: string;
}

const SIGNAL_COLORS: Record<string, string> = {
  "Premium subscriber": "bg-primary/15 text-primary border-primary/30",
  "Score below 40": "bg-destructive/15 text-destructive border-destructive/30",
  "Low visibility": "bg-[hsl(var(--score-fading))]/15 text-[hsl(var(--score-fading))] border-[hsl(var(--score-fading))]/30",
  "Declining 2+ months": "bg-[hsl(var(--score-low))]/15 text-[hsl(var(--score-low))] border-[hsl(var(--score-low))]/30",
};

export function LeadSignalsTab() {
  const [leads, setLeads] = useState<LeadUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadLeads() {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email, business_name, vertical, plan_tier, last_login, created_at");

      if (!profiles) { setLoading(false); return; }

      const leadsWithScores = await Promise.all(
        profiles.map(async (p) => {
          const { data: scores } = await supabase
            .from("scores")
            .select("overall, created_at")
            .eq("user_id", p.id)
            .order("created_at", { ascending: false })
            .limit(3);

          const latestScore = scores?.[0]?.overall ?? null;
          const previousScores = scores?.slice(1).map((s) => s.overall) ?? [];
          const declining = previousScores.length > 0 && previousScores.every((ps) => latestScore !== null && latestScore < ps);

          let leadScore = 0;
          if (p.plan_tier === "premium") leadScore += 30;
          if (latestScore !== null && latestScore < 50) leadScore += 25;
          if (declining && previousScores.length >= 2) leadScore += 25;

          const signals: string[] = [];
          if (latestScore !== null && latestScore < 40) signals.push("Score below 40");
          if (declining) signals.push("Declining 2+ months");
          if (p.plan_tier === "premium") signals.push("Premium subscriber");
          if (latestScore !== null && latestScore < 50) signals.push("Low visibility");

          return {
            id: p.id,
            name: p.name || "Unknown",
            businessName: p.business_name || "",
            vertical: p.vertical || "Other",
            planTier: p.plan_tier,
            currentScore: latestScore,
            leadScore,
            distressSignals: signals,
            lastActive: p.last_login || p.created_at,
          } as LeadUser;
        })
      );

      setLeads(
        leadsWithScores
          .filter((l) => l.distressSignals.length > 0)
          .sort((a, b) => b.leadScore - a.leadScore)
      );
      setLoading(false);
    }
    loadLeads();
  }, []);

  const filtered = leads.filter(
    (u) => !search || u.businessName.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-[hsl(var(--score-fading))]/10 text-sm">
        <AlertTriangle className="h-4 w-4 text-[hsl(var(--score-fading))] shrink-0" />
        <span>Lead signals identify WCC outreach candidates. Higher scores indicate stronger outreach opportunity.</span>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Lead Score</TableHead>
              <TableHead>Distress Signals</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No lead signals detected.</TableCell></TableRow>
            ) : filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{u.businessName || u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-bold ${(u.currentScore ?? 0) < 30 ? "text-destructive" : (u.currentScore ?? 0) < 50 ? "text-[hsl(var(--score-fading))]" : "text-foreground"}`}>
                    {u.currentScore ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`border-0 text-xs font-bold ${u.leadScore >= 80 ? "bg-destructive text-destructive-foreground" : u.leadScore >= 50 ? "bg-[hsl(var(--score-fading))] text-foreground" : "bg-muted text-muted-foreground"}`}>
                    {u.leadScore}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[280px]">
                    {u.distressSignals.map((s) => (
                      <Badge key={s} variant="outline" className={`text-[9px] px-1.5 py-0 ${SIGNAL_COLORS[s] || "bg-muted text-muted-foreground border-border"}`}>{s}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{u.vertical}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(u.lastActive).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Info, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

const MIN_SAMPLE = 20;

interface BenchmarkRow {
  vertical: string;
  count: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  meetsCohortMin: boolean;
}

export function BenchmarksTab() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [verticalFilter, setVerticalFilter] = useState("all");

  useEffect(() => {
    async function loadBenchmarks() {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, vertical");

      if (!profiles) { setLoading(false); return; }

      const { data: allScores } = await supabase
        .from("scores")
        .select("user_id, overall, created_at")
        .order("created_at", { ascending: false });

      const latestByUser = new Map<string, number>();
      allScores?.forEach((s) => {
        if (!latestByUser.has(s.user_id)) latestByUser.set(s.user_id, s.overall);
      });

      const verticalGroups: Record<string, number[]> = {};
      profiles.forEach((p) => {
        const v = p.vertical || "Other";
        const score = latestByUser.get(p.id);
        if (score !== undefined) {
          if (!verticalGroups[v]) verticalGroups[v] = [];
          verticalGroups[v].push(score);
        }
      });

      const rows = Object.entries(verticalGroups).map(([vertical, scores]) => ({
        vertical,
        count: scores.length,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        minScore: Math.min(...scores),
        maxScore: Math.max(...scores),
        meetsCohortMin: scores.length >= MIN_SAMPLE,
      }));

      setBenchmarks(rows);
      setLoading(false);
    }
    loadBenchmarks();
  }, []);

  const filtered = benchmarks.filter((b) => verticalFilter === "all" || b.vertical === verticalFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        <span>Benchmarks require ≥20 brands per vertical. Below minimum shows preliminary data.</span>
      </div>

      <Select value={verticalFilter} onValueChange={setVerticalFilter}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Vertical" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Verticals</SelectItem>
          <SelectItem value="CPG">CPG</SelectItem>
          <SelectItem value="Local Services">Local Services</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vertical</TableHead>
              <TableHead className="text-right">Brands</TableHead>
              <TableHead className="text-right">Avg Score</TableHead>
              <TableHead className="text-right">Min</TableHead>
              <TableHead className="text-right">Max</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No benchmark data available yet.</TableCell></TableRow>
            ) : filtered.map((b) => (
              <TableRow key={b.vertical} className={!b.meetsCohortMin ? "opacity-60" : ""}>
                <TableCell className="font-medium">{b.vertical}</TableCell>
                <TableCell className="text-right font-mono text-sm">{b.count}</TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">{b.avgScore}</TableCell>
                <TableCell className="text-right font-mono text-sm">{b.minScore}</TableCell>
                <TableCell className="text-right font-mono text-sm">{b.maxScore}</TableCell>
                <TableCell>
                  {b.meetsCohortMin ? (
                    <Badge variant="outline" className="text-[10px]">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">⚠️ Preliminary ({b.count}/{MIN_SAMPLE})</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

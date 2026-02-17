import { useState } from "react";
import { Search, AlertTriangle, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockLeadSignalUsers, type DistressSignal } from "@/data/mockAdminData";

const SIGNAL_COLORS: Record<DistressSignal, string> = {
  "Premium Subscriber": "bg-primary/15 text-primary border-primary/30",
  "Score Below 50": "bg-destructive/15 text-destructive border-destructive/30",
  "Declining 2+ Periods": "bg-[hsl(var(--score-fading))]/15 text-[hsl(var(--score-fading))] border-[hsl(var(--score-fading))]/30",
  "Competitor Gap Widening": "bg-[hsl(var(--score-low))]/15 text-[hsl(var(--score-low))] border-[hsl(var(--score-low))]/30",
  "High Dashboard Activity": "bg-[hsl(var(--vertical-tech))]/15 text-[hsl(var(--vertical-tech))] border-[hsl(var(--vertical-tech))]/30",
  "Clicked WCC CTA": "bg-[hsl(var(--score-highly-visible))]/15 text-[hsl(var(--score-highly-visible))] border-[hsl(var(--score-highly-visible))]/30",
  "Vertical w/ Case Studies": "bg-muted text-muted-foreground border-border",
};

export function LeadSignalsTab() {
  const [search, setSearch] = useState("");

  const filtered = mockLeadSignalUsers.filter(
    (u) => !search || u.businessName.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
  );

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
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{u.businessName}</p>
                    <p className="text-xs text-muted-foreground">{u.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-bold ${u.currentScore < 30 ? "text-destructive" : u.currentScore < 50 ? "text-[hsl(var(--score-fading))]" : "text-foreground"}`}>
                    {u.currentScore}
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
                      <Badge key={s} variant="outline" className={`text-[9px] px-1.5 py-0 ${SIGNAL_COLORS[s]}`}>{s}</Badge>
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

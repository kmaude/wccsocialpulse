import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockBenchmarks } from "@/data/mockAdminData";

const MIN_SAMPLE = 20;

export function BenchmarksTab() {
  const [verticalFilter, setVerticalFilter] = useState("all");

  const filtered = mockBenchmarks.filter((b) => verticalFilter === "all" || b.vertical === verticalFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        <span>Benchmarks require ≥20 brands per vertical. Below minimum shows "Building benchmarks."</span>
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
              <TableHead>Metric</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead className="text-right">P25</TableHead>
              <TableHead className="text-right">P50 (Median)</TableHead>
              <TableHead className="text-right">P75</TableHead>
              <TableHead className="text-right">Sample Size</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b, i) => {
              const belowMin = b.sampleSize < MIN_SAMPLE;
              return (
                <TableRow key={i} className={belowMin ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{b.metric}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{b.vertical}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-sm">{belowMin ? "—" : b.p25}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">{belowMin ? "—" : b.p50}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{belowMin ? "—" : b.p75}</TableCell>
                  <TableCell className="text-right">
                    {belowMin ? (
                      <Badge variant="secondary" className="text-[10px]">Building benchmarks</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">{b.sampleSize}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(b.lastUpdated).toLocaleDateString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

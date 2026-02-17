import { useState } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockInsights, VERTICAL_COLORS, type Insight, type Vertical, type InsightStatus } from "@/data/mockInsights";
import { InsightDetailDrawer } from "./InsightDetailDrawer";

const STATUS_STYLES: Record<InsightStatus, string> = {
  New: "bg-[hsl(var(--vertical-finance))] text-white",
  Draft: "bg-[hsl(var(--vertical-tech))] text-foreground",
  Sent: "bg-[hsl(var(--vertical-local))] text-white",
  Archived: "bg-muted text-muted-foreground",
};

export function InsightsList() {
  const [search, setSearch] = useState("");
  const [verticalFilter, setVerticalFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [sortField, setSortField] = useState<"date" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = mockInsights
    .filter((i) => {
      if (search && !i.headline.toLowerCase().includes(search.toLowerCase())) return false;
      if (verticalFilter !== "all" && !i.verticals.includes(verticalFilter as Vertical)) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "date") return dir * (new Date(a.dateGenerated).getTime() - new Date(b.dateGenerated).getTime());
      return dir * a.status.localeCompare(b.status);
    });

  const toggleSort = (field: "date" | "status") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search headlines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={verticalFilter} onValueChange={setVerticalFilter}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Vertical" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            <SelectItem value="CPG">CPG</SelectItem>
            <SelectItem value="Local Services">Local Services</SelectItem>
            <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Tech">Tech</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Headline</TableHead>
              <TableHead>Verticals</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("date")} className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground">
                  Date <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("status")} className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground">
                  Status <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((insight) => (
              <TableRow key={insight.id} className="cursor-pointer" onClick={() => setSelectedInsight(insight)}>
                <TableCell className="font-medium text-primary hover:underline">{insight.headline}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {insight.verticals.map((v) => (
                      <Badge key={v} className={`${VERTICAL_COLORS[v]} text-white text-[10px] px-2 py-0.5 border-0`}>{v}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(insight.dateGenerated).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={`${STATUS_STYLES[insight.status]} border-0 text-[10px]`}>{insight.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No insights match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <InsightDetailDrawer insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
    </div>
  );
}

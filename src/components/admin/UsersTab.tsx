import { useState } from "react";
import { Search, ArrowUpDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { mockAdminUsers, type AdminUser, type ScoreTrend } from "@/data/mockAdminData";

const TrendIcon = ({ trend }: { trend: ScoreTrend }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-[hsl(var(--score-highly-visible))]" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export function UsersTab() {
  const [search, setSearch] = useState("");
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "score" | "lastLogin">("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const filtered = mockAdminUsers
    .filter((u) => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.businessName.toLowerCase().includes(search.toLowerCase())) return false;
      if (verticalFilter !== "all" && u.vertical !== verticalFilter) return false;
      if (tierFilter !== "all" && u.planTier !== tierFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return dir * a.name.localeCompare(b.name);
      if (sortField === "score") return dir * (a.currentScore - b.currentScore);
      return dir * (new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime());
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={verticalFilter} onValueChange={setVerticalFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Vertical" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            <SelectItem value="CPG">CPG</SelectItem>
            <SelectItem value="Local Services">Local Services</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("name")} className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground">
                  Name <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("score")} className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground">
                  Score <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("lastLogin")} className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground">
                  Last Login <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} className="cursor-pointer" onClick={() => setSelectedUser(u)}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.businessName}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{u.vertical}</Badge></TableCell>
                <TableCell>
                  <Badge className={`text-[10px] border-0 ${u.planTier === "premium" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {u.planTier}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">{u.currentScore}</TableCell>
                <TableCell><TrendIcon trend={u.scoreTrend} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(u.lastLogin).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* User Detail Drawer */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedUser.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground uppercase">Business</p><p className="font-medium mt-1">{selectedUser.businessName}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground uppercase">Email</p><p className="font-medium mt-1 text-sm truncate">{selectedUser.email}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground uppercase">Vertical</p><p className="font-medium mt-1">{selectedUser.vertical}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground uppercase">Plan</p><Badge className={`mt-1 text-[10px] border-0 ${selectedUser.planTier === "premium" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{selectedUser.planTier}</Badge></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground uppercase">Score</p><p className="text-2xl font-bold mt-1 flex items-center gap-2">{selectedUser.currentScore} <TrendIcon trend={selectedUser.scoreTrend} /></p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground uppercase">Dashboard Visits (30d)</p><p className="text-2xl font-bold mt-1">{selectedUser.dashboardVisits30d}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground uppercase">Consecutive Declines</p><p className="text-2xl font-bold mt-1">{selectedUser.consecutiveDeclines}</p></CardContent></Card>
                  <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground uppercase">Clicked WCC CTA</p><p className="font-medium mt-1">{selectedUser.clickedWccCta ? "Yes" : "No"}</p></CardContent></Card>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { useState } from "react";
import { Mail, MousePointerClick, Users, TrendingUp, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockEmails, type EmailType } from "@/data/mockEmails";

export function EmailAnalytics() {
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = mockEmails.filter((e) => typeFilter === "all" || e.type === typeFilter);

  const avgOpenRate = filtered.length ? (filtered.reduce((s, e) => s + e.openRate, 0) / filtered.length).toFixed(1) : "0";
  const totalSends = filtered.reduce((s, e) => s + e.recipientCount, 0);
  const bestEmail = filtered.length ? filtered.reduce((best, e) => (e.openRate > best.openRate ? e : best)) : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{avgOpenRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalSends.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Best Performing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">{bestEmail?.subject ?? "—"}</div>
            {bestEmail && <p className="text-xs text-muted-foreground">{bestEmail.openRate}% open rate</p>}
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Email type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Monthly Report">Monthly Report</SelectItem>
            <SelectItem value="Mid-Cycle">Mid-Cycle</SelectItem>
            <SelectItem value="Score Alert">Score Alert</SelectItem>
            <SelectItem value="Welcome">Welcome</SelectItem>
            <SelectItem value="Upsell">Upsell</SelectItem>
            <SelectItem value="Re-engagement">Re-engagement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Subject</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Send Date</TableHead>
              <TableHead className="text-right">Recipients</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead className="text-right">Click Rate</TableHead>
              <TableHead>Vertical</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="font-medium">{email.subject}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{email.template}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(email.sendDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">{email.recipientCount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress value={email.openRate} className="h-2 flex-1" />
                    <span className="text-sm font-medium w-12 text-right">{email.openRate}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">{email.clickRate}%</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{email.vertical}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

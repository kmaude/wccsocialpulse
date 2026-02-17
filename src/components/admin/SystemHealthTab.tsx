import { CheckCircle, AlertTriangle, XCircle, Activity, DollarSign, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockPlatformStatuses, mockCronJobs, mockStripeSummary } from "@/data/mockAdminData";

const statusConfig = {
  operational: { icon: CheckCircle, color: "text-[hsl(var(--score-highly-visible))]", label: "Operational" },
  degraded: { icon: AlertTriangle, color: "text-[hsl(var(--score-fading))]", label: "Degraded" },
  down: { icon: XCircle, color: "text-destructive", label: "Down" },
};

const cronStatusConfig = {
  success: { color: "bg-[hsl(var(--score-highly-visible))]/15 text-[hsl(var(--score-highly-visible))]" },
  failed: { color: "bg-destructive/15 text-destructive" },
  running: { color: "bg-primary/15 text-primary" },
};

export function SystemHealthTab() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${mockStripeSummary.mrr.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{mockStripeSummary.subscribers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{mockStripeSummary.churnRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active / Inactive</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStripeSummary.activeUsers} <span className="text-sm font-normal text-muted-foreground">/ {mockStripeSummary.inactiveUsers}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Platform API Status */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Platform API Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {mockPlatformStatuses.map((p) => {
            const cfg = statusConfig[p.status];
            const Icon = cfg.icon;
            return (
              <Card key={p.platform}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{p.platform}</p>
                    <p className="text-xs text-muted-foreground">{cfg.label} · {p.avgLatencyMs}ms</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CRON Jobs */}
      <div>
        <h3 className="text-sm font-semibold mb-3">CRON Jobs</h3>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCronJobs.map((job) => (
                <TableRow key={job.name}>
                  <TableCell className="font-medium">{job.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{job.schedule}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(job.lastRun).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`border-0 text-[10px] capitalize ${cronStatusConfig[job.status].color}`}>{job.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

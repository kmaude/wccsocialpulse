import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, DollarSign, Users, Activity, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const platformStatuses = [
  { platform: "Instagram", status: "active" as const, provider: "Instagram Statistics API" },
  { platform: "YouTube", status: "active" as const, provider: "YouTube Data API v3" },
  { platform: "Facebook", status: "active" as const, provider: "SociaVault" },
  { platform: "TikTok", status: "active" as const, provider: "SociaVault" },
];

export function SystemHealthTab() {
  const [stripeData, setStripeData] = useState<{ mrr: number; subscribers: number; failedPayments: number } | null>(null);
  const [userCounts, setUserCounts] = useState<{ total: number; active: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      // Stripe summary
      const { data } = await supabase.functions.invoke("admin-payments");
      if (data) {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const mrr = data.succeeded
          ?.filter((inv: any) => new Date(inv.paid_at).getTime() > thirtyDaysAgo)
          ?.reduce((sum: number, inv: any) => sum + (inv.amount / 100), 0) || 0;
        setStripeData({
          mrr: Math.round(mrr),
          subscribers: data.upcoming?.length || 0,
          failedPayments: data.failed?.length || 0,
        });
      }

      // User counts
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, last_login");
      if (profiles) {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const active = profiles.filter((p) => p.last_login && new Date(p.last_login).getTime() > sevenDaysAgo).length;
        setUserCounts({ total: profiles.length, active });
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stripeData ? `$${stripeData.mrr.toLocaleString()}` : <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Invoices</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stripeData ? stripeData.subscribers : <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stripeData ? stripeData.failedPayments : <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active / Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userCounts ? (
                <>{userCounts.active} <span className="text-sm font-normal text-muted-foreground">/ {userCounts.total}</span></>
              ) : <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform API Status */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Platform API Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {platformStatuses.map((p) => (
            <Card key={p.platform}>
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-[hsl(var(--score-highly-visible))]" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.platform}</p>
                  <p className="text-xs text-muted-foreground">{p.provider}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CRON Jobs */}
      <div>
        <h3 className="text-sm font-semibold mb-3">CRON Jobs</h3>
        <div className="flex items-center gap-2 p-4 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span>CRON jobs will be configured in the next deployment phase.</span>
        </div>
      </div>
    </div>
  );
}

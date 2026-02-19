import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertTriangle, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

type SucceededPayment = {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  amount: number;
  currency: string;
  paid_at: string | null;
  invoice_url: string | null;
};

type UpcomingPayment = {
  customer_email: string | null;
  customer_name: string | null;
  amount: number;
  currency: string;
  due_date: string | null;
  subscription_id: string;
};

type FailedPayment = {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  amount: number;
  currency: string;
  due_date: string | null;
  attempt_count: number;
  next_attempt: string | null;
  invoice_url: string | null;
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PaymentsTab() {
  const [loading, setLoading] = useState(true);
  const [succeeded, setSucceeded] = useState<SucceededPayment[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingPayment[]>([]);
  const [failed, setFailed] = useState<FailedPayment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-payments");
      if (fnError) throw fnError;
      setSucceeded(data.succeeded ?? []);
      setUpcoming(data.upcoming ?? []);
      setFailed(data.failed ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading payments from Stripe…</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchPayments}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1 max-w-lg">
          <Card>
            <CardContent className="py-3 px-4 text-center">
              <p className="text-2xl font-bold text-[hsl(var(--score-highly-visible))]">{succeeded.length}</p>
              <p className="text-xs text-muted-foreground">Succeeded</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4 text-center">
              <p className="text-2xl font-bold text-primary">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4 text-center">
              <p className="text-2xl font-bold text-destructive">{failed.length}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPayments} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="succeeded" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="succeeded" className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Succeeded
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Upcoming
          </TabsTrigger>
          <TabsTrigger value="failed" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Failed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="succeeded">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {succeeded.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No payments yet</TableCell>
                  </TableRow>
                ) : (
                  succeeded.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{p.customer_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{p.customer_email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{formatAmount(p.amount, p.currency)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(p.paid_at)}</TableCell>
                      <TableCell>
                        {p.invoice_url && (
                          <a href={p.invoice_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No upcoming payments</TableCell>
                  </TableRow>
                ) : (
                  upcoming.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="font-medium text-sm">{p.customer_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{p.customer_email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{formatAmount(p.amount, p.currency)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(p.due_date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="failed">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Next Retry</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No failed payments 🎉</TableCell>
                  </TableRow>
                ) : (
                  failed.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{p.customer_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{p.customer_email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{formatAmount(p.amount, p.currency)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-[10px]">{p.attempt_count} attempt{p.attempt_count !== 1 ? "s" : ""}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(p.next_attempt)}</TableCell>
                      <TableCell>
                        {p.invoice_url && (
                          <a href={p.invoice_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

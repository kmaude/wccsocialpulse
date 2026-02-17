import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, AlertTriangle, BarChart3, Mail, Activity } from "lucide-react";
import { UsersTab } from "@/components/admin/UsersTab";
import { LeadSignalsTab } from "@/components/admin/LeadSignalsTab";
import { BenchmarksTab } from "@/components/admin/BenchmarksTab";
import { EmailAnalytics } from "@/components/admin/EmailAnalytics";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";
import { InsightsList } from "@/components/admin/InsightsList";
import { SystemHealthTab } from "@/components/admin/SystemHealthTab";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="font-display text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users, leads, benchmarks, emails, and system health</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4" /> <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-1.5 text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4" /> <span className="hidden sm:inline">Lead Signals</span>
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Benchmarks</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-1.5 text-xs sm:text-sm">
              <Mail className="h-4 w-4" /> <span className="hidden sm:inline">Email Reports</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-1.5 text-xs sm:text-sm">
              <Activity className="h-4 w-4" /> <span className="hidden sm:inline">System Health</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="leads">
            <LeadSignalsTab />
          </TabsContent>
          <TabsContent value="benchmarks">
            <BenchmarksTab />
          </TabsContent>
          <TabsContent value="emails">
            <Tabs defaultValue="analytics" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              <TabsContent value="analytics"><EmailAnalytics /></TabsContent>
              <TabsContent value="templates"><EmailTemplateEditor /></TabsContent>
              <TabsContent value="insights"><InsightsList /></TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="health">
            <SystemHealthTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

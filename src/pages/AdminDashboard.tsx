import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, BarChart3, Mail } from "lucide-react";
import { InsightsList } from "@/components/admin/InsightsList";
import { EmailAnalytics } from "@/components/admin/EmailAnalytics";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="font-display text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage insights, emails, and templates</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="insights" className="gap-1.5">
              <Lightbulb className="h-4 w-4" /> Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5">
              <Mail className="h-4 w-4" /> Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <InsightsList />
          </TabsContent>
          <TabsContent value="analytics">
            <EmailAnalytics />
          </TabsContent>
          <TabsContent value="templates">
            <EmailTemplateEditor />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

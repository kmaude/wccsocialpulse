import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { session, loading } = useAuth();
  const { toast } = useToast();

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  const handleMagicLink = async () => {
    if (!email.trim()) {
      toast({ title: "Enter your email", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/onboarding" },
    });
    setSending(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mx-auto mb-2">
              <Mail className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Sign in to Social Pulse</CardTitle>
            <CardDescription>We'll send you a magic link to your email</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-3 py-4">
                <div className="text-4xl">✉️</div>
                <h3 className="font-display font-semibold text-lg">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  We sent a magic link to <strong>{email}</strong>. Click it to sign in.
                </p>
                <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
                  Try a different email
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                  className="h-12"
                />
                <Button
                  onClick={handleMagicLink}
                  disabled={sending}
                  className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
                >
                  {sending ? "Sending..." : "Send Magic Link"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;

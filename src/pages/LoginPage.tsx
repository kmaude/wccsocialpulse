import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, ArrowRight, LogIn, UserPlus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();

  if (!authLoading && session) return <Navigate to="/dashboard" replace />;

  // Rate limit: Supabase handles OTP rate limiting (default 60s cooldown). We display a toast if user tries again too quickly.
  const handleMagicLink = async () => {
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/onboarding" },
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("rate limit")) {
        toast({ title: "Please wait a moment before requesting another link.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      setMagicLinkSent(true);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({ title: "Enter your email first", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password reset link sent to your email." });
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="w-full max-w-md">
            <CardContent className="text-center space-y-3 py-8">
              <div className="text-4xl">✉️</div>
              <h3 className="font-display font-semibold text-lg">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We sent a secure login link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setMagicLinkSent(false)}>
                Back to login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mx-auto mb-2">
              <Mail className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Welcome to Social Pulse</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="magic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="magic"><Wand2 className="h-4 w-4 mr-1" /> Magic Link</TabsTrigger>
                <TabsTrigger value="password"><LogIn className="h-4 w-4 mr-1" /> Password</TabsTrigger>
                <TabsTrigger value="signup"><UserPlus className="h-4 w-4 mr-1" /> Sign Up</TabsTrigger>
              </TabsList>

              {/* Tab 1: Magic Link (default) */}
              <TabsContent value="magic" className="space-y-4 pt-4">
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
                  disabled={loading}
                  className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll email you a secure link. No password needed.
                </p>
              </TabsContent>

              {/* Tab 2: Password */}
              <TabsContent value="password" className="space-y-4 pt-4">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                  className="h-12"
                />
                <Button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
                >
                  {loading ? "Signing in..." : "Sign In"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="block w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot Password?
                </button>
              </TabsContent>

              {/* Tab 3: Sign Up (magic link) */}
              <TabsContent value="signup" className="space-y-4 pt-4">
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
                  disabled={loading}
                  className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
                >
                  {loading ? "Sending..." : "Create Your Free Account"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll email you a secure link. No password needed.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;

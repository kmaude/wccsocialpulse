import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, ArrowRight, LogIn, UserPlus } from "lucide-react";
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
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();

  if (!authLoading && session) return <Navigate to="/dashboard" replace />;

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/onboarding" },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setConfirmationSent(true);
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

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="w-full max-w-md">
            <CardContent className="text-center space-y-3 py-8">
              <div className="text-4xl">✉️</div>
              <h3 className="font-display font-semibold text-lg">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it to verify your account and get started.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setConfirmationSent(false)}>
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
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin"><LogIn className="h-4 w-4 mr-1" /> Sign In</TabsTrigger>
                <TabsTrigger value="signup"><UserPlus className="h-4 w-4 mr-1" /> Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="space-y-4 pt-4">
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
              </TabsContent>
              <TabsContent value="signup" className="space-y-4 pt-4">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
                <Input
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                  className="h-12"
                />
                <Button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
                >
                  {loading ? "Creating account..." : "Create Account"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll send a confirmation email to verify your address.
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

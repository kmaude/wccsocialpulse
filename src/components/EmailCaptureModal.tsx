import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function EmailCaptureModal({
  open, onOpenChange, score,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mx-auto mb-2">
            <Mail className="h-6 w-6 text-accent-foreground" />
          </div>
          <DialogTitle className="text-center font-display">Get Your Full Report Free</DialogTitle>
          <DialogDescription className="text-center">
            Your score is <strong>{score}</strong>. Create an account to unlock the full 6-dimension breakdown, AI recommendations, and competitor tracking.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="text-center space-y-3 py-4">
            <div className="text-4xl">✉️</div>
            <p className="text-sm text-muted-foreground">
              Check your email for a confirmation link to access your full report.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
              disabled={sending}
              className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {sending ? "Creating account..." : "Create Account"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We'll send a confirmation email to verify your address.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

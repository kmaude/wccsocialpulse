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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mx-auto mb-2">
            <Mail className="h-6 w-6 text-accent-foreground" />
          </div>
          <DialogTitle className="text-center font-display">Get Your Full Report Free</DialogTitle>
          <DialogDescription className="text-center">
            Your score is <strong>{score}</strong>. Enter your email to unlock the full 6-dimension breakdown, AI recommendations, and competitor tracking.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="text-center space-y-3 py-4">
            <div className="text-4xl">✉️</div>
            <p className="text-sm text-muted-foreground">
              Check your email for a magic link to access your full report.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="h-12"
            />
            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {sending ? "Sending..." : "Send Magic Link"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We'll send a secure link — no password needed.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

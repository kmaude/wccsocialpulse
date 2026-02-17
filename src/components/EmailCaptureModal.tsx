import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PlatformHandles } from "@/components/PlatformHandleForm";

export function EmailCaptureModal({
  open, onOpenChange, score, handles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  handles?: PlatformHandles | null;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setSending(true);
    // Rate limit: Supabase handles OTP rate limiting (default 60s cooldown). We display a toast if user tries again too quickly.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/onboarding",
        data: {
          instagram_handle: handles?.instagram || null,
          facebook_handle: handles?.facebook || null,
          youtube_handle: handles?.youtube || null,
          tiktok_handle: handles?.tiktok || null,
        },
      },
    });
    setSending(false);
    if (error) {
      if (error.message.toLowerCase().includes("rate limit")) {
        toast({ title: "Please wait a moment before requesting another link.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
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
              Check your email — we sent you a magic link to access your full report.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMagicLink()}
              className="h-12"
            />
            <Button
              onClick={handleSendMagicLink}
              disabled={sending}
              className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {sending ? "Sending..." : "Send My Report Link"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We'll email you a secure link. No password needed.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

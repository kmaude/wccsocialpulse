import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function SetPasswordCard() {
  const { profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  if (profile?.has_password) return null;

  const handleSetPassword = async () => {
    if (!password || !confirm) {
      toast({ title: "Fill in both fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Mark has_password true
      if (profile) {
        await supabase.from("profiles").update({ has_password: true }).eq("id", profile.id);
      }
      toast({ title: "Password set successfully!" });
      setOpen(false);
      setPassword("");
      setConfirm("");
      await refreshProfile();
    }
    setSaving(false);
  };

  return (
    <>
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent shrink-0">
            <KeyRound className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Set a password for faster login</p>
            <p className="text-xs text-muted-foreground">
              You're currently using magic links. Set a password to sign in directly next time.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Set Password
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Set Your Password</DialogTitle>
            <DialogDescription>Choose a password for direct sign-in.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="New password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
              className="h-12"
            />
            <Button
              onClick={handleSetPassword}
              disabled={saving}
              className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {saving ? "Saving..." : "Set Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

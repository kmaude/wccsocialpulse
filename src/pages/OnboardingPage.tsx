import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const TOS_VERSION = "1.0";

const OnboardingPage = () => {
  const { session, loading, hasCompletedOnboarding, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [marketingConsent, setMarketingConsent] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [vertical, setVertical] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !session) return <Navigate to="/login" replace />;
  if (!loading && hasCompletedOnboarding) return <Navigate to="/dashboard" replace />;

  const canSubmit = marketingConsent && tosAccepted && vertical;

  const handleSubmit = async () => {
    if (!canSubmit || !session) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        marketing_consent: true,
        tos_accepted_at: new Date().toISOString(),
        tos_version_id: TOS_VERSION,
        vertical: vertical as "CPG" | "Local Services" | "Other",
      })
      .eq("id", session.user.id);

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Welcome to Social Pulse</CardTitle>
            <CardDescription>Just a few things before we get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vertical Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">What's your industry?</Label>
              <RadioGroup value={vertical} onValueChange={setVertical} className="space-y-2">
                {["CPG", "Local Services", "Other"].map((v) => (
                  <div key={v} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={v} id={v} />
                    <Label htmlFor={v} className="cursor-pointer flex-1">{v === "CPG" ? "CPG (Consumer Packaged Goods)" : v}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Marketing Consent */}
            <div className="flex items-start space-x-3 rounded-lg border p-3">
              <Checkbox
                id="marketing"
                checked={marketingConsent}
                onCheckedChange={(c) => setMarketingConsent(!!c)}
                className="mt-0.5"
              />
              <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer">
                I agree to receive marketing communications from Social Pulse and West Coast Content Company (DBA West Coast Content), including monthly reports, insights, and promotional offers. You can unsubscribe at any time.
              </Label>
            </div>

            {/* ToS + Privacy */}
            <div className="flex items-start space-x-3 rounded-lg border p-3">
              <Checkbox
                id="tos"
                checked={tosAccepted}
                onCheckedChange={(c) => setTosAccepted(!!c)}
                className="mt-0.5"
              />
              <Label htmlFor="tos" className="text-sm leading-relaxed cursor-pointer">
                I agree to the{" "}
                <Link to="/terms" className="text-primary underline" target="_blank">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-primary underline" target="_blank">Privacy Policy</Link>.
              </Label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {submitting ? "Setting up..." : "Continue to Dashboard"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OnboardingPage;

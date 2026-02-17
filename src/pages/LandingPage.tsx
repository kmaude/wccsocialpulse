import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Eye, Zap, Shield, TrendingUp, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmailCaptureModal } from "@/components/EmailCaptureModal";
import { PlatformHandleForm, type PlatformHandles } from "@/components/PlatformHandleForm";
import { ScanResultsCard } from "@/components/landing/ScanResultsCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const FEATURES = [
  { icon: Eye, title: "Visibility Score", desc: "One 0–100 number that captures your brand's entire social presence." },
  { icon: BarChart3, title: "6-Dimension Breakdown", desc: "Velocity, Video, Engagement, Competitors, Coverage, and Recency." },
  { icon: Target, title: "Competitor Tracking", desc: "See exactly where you stand versus your top competitors." },
  { icon: Zap, title: "AI-Powered Insights", desc: "Actionable recommendations powered by Claude to improve your score." },
  { icon: TrendingUp, title: "Trend Detection", desc: "Spot opportunities before your competitors do." },
  { icon: Shield, title: "Vertical Benchmarks", desc: "Industry-specific scoring calibrated to your vertical." },
];

const PRICING = [
  {
    name: "Free", price: "$0", desc: "Visibility score powered by public data",
    features: [
      "Composite Visibility Score",
      "6-dimension breakdown",
      "Top/bottom 3 posts per quarter",
      "Monthly email report",
      "2 competitors (1 AI-suggested + 1 manual)",
      "Month-over-month trends",
      "Instagram + Facebook + YouTube (public data)",
    ],
    cta: "Get Your Free Score", highlighted: false,
  },
  {
    name: "Premium", price: "$29", period: "/mo", desc: "Full visibility intelligence with OAuth analytics",
    features: [
      "Everything in Free, plus:",
      "Weekly score updates (vs monthly)",
      "Top/bottom 10 posts per quarter",
      "10 competitors + AI auto-suggestions",
      "Full audience demographics & psychographics",
      "24-month lookback audit",
      "Opportunity gap analysis",
      "Sentiment analysis",
      "All 4 platforms including TikTok",
      'No "estimated" disclaimer on scores',
    ],
    cta: "Start Premium", highlighted: true,
  },
];

const LandingPage = () => {
  const [scanning, setScanning] = useState(false);
  const [demoScore, setDemoScore] = useState<number | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [submittedHandles, setSubmittedHandles] = useState<PlatformHandles | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleScan = (handles: PlatformHandles) => {
    setSubmittedHandles(handles);
    setScanning(true);
    setDemoScore(null);
    setTimeout(() => {
      setDemoScore(Math.floor(Math.random() * 40) + 35);
      setScanning(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero-subtle" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="px-4 py-1 text-xs font-medium border-primary/20 text-primary">
              Visibility Intelligence Engine
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Stop guessing. <br />
              <span className="text-gradient">Start seeing.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Social Pulse scores your brand's social media visibility on a 0–100 scale, so you know exactly where you stand — and what to fix.
            </p>

            {/* Scan Form */}
            <div className="max-w-lg mx-auto pt-4">
              <PlatformHandleForm onSubmit={handleScan} scanning={scanning} />
            </div>
          </div>

          {/* Scan Result */}
          {scanning && (
            <div className="max-w-sm mx-auto mt-12 text-center">
              <Card className="shadow-glow border-primary/10">
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-4 py-8">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <Eye className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">Analyzing your profiles...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {!scanning && demoScore !== null && (
            <ScanResultsCard
              score={demoScore}
              session={session}
              onEmailCapture={() => setEmailModalOpen(true)}
            />
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Everything you need to <span className="text-gradient">own your visibility</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Six dimensions of analysis distilled into one actionable score.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Card key={i} className="group hover:shadow-md transition-all hover:border-primary/20">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent mb-2">
                    <f.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-lg font-display">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-3">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PRICING.map((plan, i) => (
              <Card key={i} className={`relative ${plan.highlighted ? "border-primary shadow-glow" : ""}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-hero text-primary-foreground border-0">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                  </div>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.highlighted ? "bg-gradient-hero text-primary-foreground hover:opacity-90" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center bg-gradient-hero-subtle border-primary/10">
            <CardContent className="py-12 space-y-5">
              <h2 className="font-display text-3xl font-bold">Ready to see your score?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Built by West Coast Content — the agency behind brands that refuse to be invisible.
              </p>
              <Button size="lg" className="bg-gradient-hero text-primary-foreground hover:opacity-90">
                Get Your Free Scan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground pt-2">
                Social Pulse is a product of West Coast Content Company.{" "}
                <a href="https://westcoastcontent.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:text-foreground transition-colors">
                  Learn about our agency services →
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Email Capture Modal */}
      {demoScore !== null && (
        <EmailCaptureModal
          open={emailModalOpen}
          onOpenChange={setEmailModalOpen}
          score={demoScore}
          handles={submittedHandles}
        />
      )}
    </div>
  );
};

export default LandingPage;

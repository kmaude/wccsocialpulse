import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const TermsPage = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Last updated: February 2026</p>
        <p>These Terms of Service ("Terms") govern your use of the Social Pulse platform operated by West Coast Content Company (DBA West Coast Content).</p>
        <h2 className="font-display text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing or using Social Pulse, you agree to be bound by these Terms. If you do not agree, do not use the service.</p>
        <h2 className="font-display text-xl font-semibold text-foreground">2. Service Description</h2>
        <p>Social Pulse provides social media visibility scoring, analytics, and AI-powered recommendations for brands and businesses.</p>
        <h2 className="font-display text-xl font-semibold text-foreground">3. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
        <h2 className="font-display text-xl font-semibold text-foreground">4. Data Usage</h2>
        <p>We collect and process data as described in our Privacy Policy. By using our service, you consent to such processing.</p>
        <h2 className="font-display text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
        <p>Social Pulse is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service.</p>
        <p className="text-xs text-muted-foreground italic">This is a placeholder Terms of Service. Please consult with a legal professional for your final terms.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsPage;

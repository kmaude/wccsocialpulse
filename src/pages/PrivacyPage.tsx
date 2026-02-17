import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const PrivacyPage = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Last updated: February 2026</p>
        <p>This Privacy Policy describes how West Coast Content Company (DBA West Coast Content) collects, uses, and shares information through Social Pulse.</p>
        <h2 className="font-display text-xl font-semibold text-foreground">1. Information We Collect</h2>
        <p>We collect information you provide directly (email, business name, vertical) and information gathered automatically (usage data, analytics).</p>
        <h2 className="font-display text-xl font-semibold text-foreground">2. How We Use Information</h2>
        <p>We use your information to provide and improve Social Pulse, send reports and insights, and communicate with you about the service.</p>
        <h2 className="font-display text-xl font-semibold text-foreground">3. Marketing Communications</h2>
        <p>With your consent, we may send you marketing emails including monthly reports, insights, and promotional offers. You can unsubscribe at any time.</p>
        <h2 className="font-display text-xl font-semibold text-foreground">4. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal data.</p>
        <h2 className="font-display text-xl font-semibold text-foreground">5. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at privacy@socialpulse.com.</p>
        <p className="text-xs text-muted-foreground italic">This is a placeholder Privacy Policy. Please consult with a legal professional for your final policy.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPage;

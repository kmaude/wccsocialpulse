import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const TermsPage = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground">
        These terms are currently being finalized by legal counsel. Please check back soon.
      </p>
    </main>
    <Footer />
  </div>
);

export default TermsPage;

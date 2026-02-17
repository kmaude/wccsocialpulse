import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const ForbiddenPage = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <ShieldX className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-4xl font-bold font-display">403</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          You don't have permission to access this page. Admin access is required.
        </p>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default ForbiddenPage;

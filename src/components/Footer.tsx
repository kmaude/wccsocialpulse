import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Social Pulse</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The visibility intelligence engine for brands that refuse to be invisible.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Free Scan</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><span className="cursor-default">Pricing</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://westcoastcontent.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">West Coast Content</a></li>
              <li><span className="cursor-default">About Social Pulse</span></li>
              <li><a href="mailto:hello@westcoastcontent.com" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} West Coast Content Company (DBA West Coast Content). All rights reserved.
        </div>
      </div>
    </footer>
  );
}

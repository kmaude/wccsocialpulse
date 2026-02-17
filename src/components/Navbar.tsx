import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Admin", path: "/admin" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero animate-pulse-glow">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Social Pulse</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sm font-medium",
                  location.pathname === item.path && "bg-accent text-accent-foreground"
                )}
              >
                {item.label}
              </Button>
            </Link>
          ))}
          <div className="ml-3 pl-3 border-l">
            <Button size="sm" className="bg-gradient-hero hover:opacity-90 text-primary-foreground">
              Get Started
            </Button>
          </div>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-card p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path && "bg-accent"
                )}
              >
                {item.label}
              </Button>
            </Link>
          ))}
          <Button className="w-full bg-gradient-hero text-primary-foreground">Get Started</Button>
        </div>
      )}
    </nav>
  );
}

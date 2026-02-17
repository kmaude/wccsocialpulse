import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_NAV = [
  { label: "Home", path: "/" },
];

const AUTH_NAV = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, isAdmin, signOut, loading } = useAuth();

  const navItems = session ? AUTH_NAV : PUBLIC_NAV;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero animate-pulse-glow">
            <Activity className="h-5 w-5 text-primary-foreground logo-icon-shimmer" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Social Pulse</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
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

          {session && isAdmin && (
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sm font-medium",
                  location.pathname === "/admin" && "bg-accent text-accent-foreground"
                )}
              >
                Admin
              </Button>
            </Link>
          )}

          <div className="ml-3 pl-3 border-l">
            {!loading && !session ? (
              <Link to="/login">
                <Button size="sm" className="bg-gradient-hero hover:opacity-90 text-primary-foreground">
                  Sign In
                </Button>
              </Link>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {user?.email?.charAt(0).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm max-w-[120px] truncate hidden lg:inline">
                      {user?.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
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
          {navItems.map((item) => (
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
          {session && isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Admin</Button>
            </Link>
          )}
          {!loading && !session ? (
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button className="w-full bg-gradient-hero text-primary-foreground">Sign In</Button>
            </Link>
          ) : session ? (
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          ) : null}
        </div>
      )}
    </nav>
  );
}

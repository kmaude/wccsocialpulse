import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Instagram, Facebook, Youtube } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 3.76.92V6.69Z" />
  </svg>
);

const PLATFORMS = [
  { key: "instagram", icon: Instagram, placeholder: "@yourbrand" },
  { key: "facebook", icon: Facebook, placeholder: "@yourbrand" },
  { key: "youtube", icon: Youtube, placeholder: "@yourbrand" },
  { key: "tiktok", icon: TikTokIcon, placeholder: "@yourbrand" },
] as const;

export type PlatformHandles = {
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
};

interface PlatformHandleFormProps {
  onSubmit: (handles: PlatformHandles) => void;
  scanning: boolean;
}

export function PlatformHandleForm({ onSubmit, scanning }: PlatformHandleFormProps) {
  const [handles, setHandles] = useState<PlatformHandles>({
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
  });
  const firstEditedRef = useState<string | null>(null);
  const [firstEdited, setFirstEdited] = [firstEditedRef[0], firstEditedRef[1]];

  const updateHandle = (key: string, value: string) => {
    // Track which platform was edited first
    if (!firstEdited) {
      setFirstEdited(key);
    }
    const isSource = !firstEdited || firstEdited === key;

    setHandles((prev) => {
      const next = { ...prev, [key]: value };

      // Auto-fill others only when typing in the first-edited platform
      if (isSource) {
        for (const p of PLATFORMS) {
          if (p.key !== key && (prev[p.key] === "" || prev[p.key] === prev[key as keyof PlatformHandles])) {
            next[p.key as keyof PlatformHandles] = value;
          }
        }
      }

      return next;
    });
  };

  const hasAtLeastOne = Object.values(handles).some((h) => h.trim() !== "");

  const handleSubmit = () => {
    if (hasAtLeastOne) onSubmit(handles);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PLATFORMS.map((p) => (
          <div key={p.key} className="relative">
            <p.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={handles[p.key]}
              onChange={(e) => updateHandle(p.key, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={p.placeholder}
              className="pl-10 h-11 text-sm"
            />
          </div>
        ))}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={scanning || !hasAtLeastOne}
        className="w-full h-12 bg-gradient-hero text-primary-foreground hover:opacity-90"
      >
        {scanning ? "Scanning..." : "Get Your Free Score"}
        <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Enter at least one handle. No signup required.
      </p>
    </div>
  );
}

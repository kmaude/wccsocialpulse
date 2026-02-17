import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", prefix: "@", placeholder: "yourbrand" },
  { key: "facebook", label: "Facebook", prefix: "fb.com/", placeholder: "yourbrand" },
  { key: "youtube", label: "YouTube", prefix: "@", placeholder: "yourbrand" },
  { key: "tiktok", label: "TikTok", prefix: "@", placeholder: "yourbrand" },
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
  const [firstEdited, setFirstEdited] = useState<string | null>(null);

  const updateHandle = (key: string, value: string) => {
    setHandles((prev) => {
      const next = { ...prev, [key]: value };

      // If this is the first platform being typed into, auto-fill empty others
      if (!firstEdited || firstEdited === key) {
        setFirstEdited(key);
        for (const p of PLATFORMS) {
          if (p.key !== key && prev[p.key] === "") {
            next[p.key] = value;
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground select-none pointer-events-none">
              {p.label}
            </span>
            <Input
              value={handles[p.key]}
              onChange={(e) => updateHandle(p.key, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={p.placeholder}
              className="pl-24 h-11 text-sm"
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

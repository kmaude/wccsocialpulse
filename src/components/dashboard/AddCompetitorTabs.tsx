import { useState } from "react";
import { Search, Link, Globe, Loader2, Check, Instagram, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 3.76.92V6.69Z" />
  </svg>
);

export interface CandidateProfile {
  handle: string;
  displayName: string;
  platform: string;
  followers: number;
  avatarUrl: string;
  bio: string;
}

interface Props {
  onConfirm: (candidate: CandidateProfile) => void;
  confirming: string | null;
}

const SOCIAL_URL_PATTERNS: { platform: string; regex: RegExp; icon: any }[] = [
  { platform: "Instagram", regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?/, icon: Instagram },
  { platform: "Facebook", regex: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9_.]+)\/?/, icon: Facebook },
  { platform: "Youtube", regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@?([a-zA-Z0-9_.]+)\/?/, icon: Youtube },
  { platform: "Tiktok", regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/?/, icon: TikTokIcon },
];

function parseSocialUrl(url: string): { platform: string; handle: string } | null {
  for (const { platform, regex } of SOCIAL_URL_PATTERNS) {
    const match = url.match(regex);
    if (match?.[1]) {
      const handle = match[1];
      if (!["share", "sharer", "intent", "login", "signup", "help", "about"].includes(handle.toLowerCase())) {
        return { platform, handle };
      }
    }
  }
  return null;
}

export function AddCompetitorTabs({ onConfirm, confirming }: Props) {
  const { toast } = useToast();

  // Search tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [searching, setSearching] = useState(false);

  // Social URL tab state
  const [socialUrl, setSocialUrl] = useState("");
  const [parsedSocial, setParsedSocial] = useState<{ platform: string; handle: string } | null>(null);
  const [lookingUpSocial, setLookingUpSocial] = useState(false);
  const [socialCandidate, setSocialCandidate] = useState<CandidateProfile | null>(null);

  // Website URL tab state
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [discoveredSocials, setDiscoveredSocials] = useState<Record<string, string> | null>(null);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  // --- Search tab ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setCandidates([]);
    try {
      const { data, error } = await supabase.functions.invoke("search-competitor", {
        body: { query: searchQuery.trim() },
      });
      if (error) throw error;
      if (data?.success) {
        setCandidates(
          data.candidates.map((c: any) => ({
            handle: c.handle,
            displayName: c.display_name,
            platform: c.platform.charAt(0).toUpperCase() + c.platform.slice(1),
            followers: c.follower_count || 0,
            avatarUrl: c.avatar_url || "",
            bio: c.bio || "",
          }))
        );
      }
    } catch (err) {
      console.error("Competitor search error:", err);
      toast({ title: "Search failed", description: "Could not search for competitors. Try again.", variant: "destructive" });
    }
    setSearching(false);
  };

  // --- Social URL tab ---
  const handleSocialUrlChange = (value: string) => {
    setSocialUrl(value);
    setSocialCandidate(null);
    const parsed = parseSocialUrl(value);
    setParsedSocial(parsed);
  };

  const handleSocialLookup = async () => {
    if (!parsedSocial) return;
    setLookingUpSocial(true);
    setSocialCandidate(null);
    try {
      const { data, error } = await supabase.functions.invoke("search-competitor", {
        body: { query: parsedSocial.handle },
      });
      if (error) throw error;
      if (data?.success && data.candidates.length > 0) {
        // Find the best match for this platform
        const platformMatch = data.candidates.find(
          (c: any) => c.platform.toLowerCase() === parsedSocial.platform.toLowerCase()
        ) || data.candidates[0];
        setSocialCandidate({
          handle: platformMatch.handle || parsedSocial.handle,
          displayName: platformMatch.display_name || parsedSocial.handle,
          platform: parsedSocial.platform,
          followers: platformMatch.follower_count || 0,
          avatarUrl: platformMatch.avatar_url || "",
          bio: platformMatch.bio || "",
        });
      } else {
        // No API match, create a basic candidate from URL
        setSocialCandidate({
          handle: parsedSocial.handle,
          displayName: parsedSocial.handle,
          platform: parsedSocial.platform,
          followers: 0,
          avatarUrl: "",
          bio: "",
        });
      }
    } catch {
      // Fallback: still let user add with handle from URL
      setSocialCandidate({
        handle: parsedSocial.handle,
        displayName: parsedSocial.handle,
        platform: parsedSocial.platform,
        followers: 0,
        avatarUrl: "",
        bio: "",
      });
    }
    setLookingUpSocial(false);
  };

  // --- Website URL tab ---
  const handleDiscoverSocials = async () => {
    if (!websiteUrl.trim()) return;
    setDiscoverLoading(true);
    setDiscoveredSocials(null);
    try {
      const { data, error } = await supabase.functions.invoke("discover-socials", {
        body: { url: websiteUrl.trim() },
      });
      if (error) throw error;
      if (data?.success && data.socials && Object.keys(data.socials).length > 0) {
        setDiscoveredSocials(data.socials);
      } else {
        toast({ title: "No profiles found", description: "Could not find social media links on that website.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Discover socials error:", err);
      toast({ title: "Error", description: "Failed to scan website. Check the URL and try again.", variant: "destructive" });
    }
    setDiscoverLoading(false);
  };

  const handleConfirmDiscovered = (platform: string, handle: string) => {
    onConfirm({
      handle,
      displayName: handle,
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      followers: 0,
      avatarUrl: "",
      bio: "",
    });
  };

  const PLATFORM_ICONS: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    youtube: Youtube,
    tiktok: TikTokIcon,
  };

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="search" className="gap-1.5 text-xs"><Search className="h-3.5 w-3.5" /> Search</TabsTrigger>
        <TabsTrigger value="social-url" className="gap-1.5 text-xs"><Link className="h-3.5 w-3.5" /> Social URL</TabsTrigger>
        <TabsTrigger value="website" className="gap-1.5 text-xs"><Globe className="h-3.5 w-3.5" /> Website</TabsTrigger>
      </TabsList>

      {/* Search Tab */}
      <TabsContent value="search" className="space-y-3 mt-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search business name or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} size="icon" variant="outline" disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <CandidateList candidates={candidates} confirming={confirming} onConfirm={onConfirm} searching={searching} />
      </TabsContent>

      {/* Social URL Tab */}
      <TabsContent value="social-url" className="space-y-3 mt-3">
        <div className="flex gap-2">
          <Input
            placeholder="Paste social media URL..."
            value={socialUrl}
            onChange={(e) => handleSocialUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parsedSocial && handleSocialLookup()}
          />
          <Button onClick={handleSocialLookup} size="icon" variant="outline" disabled={!parsedSocial || lookingUpSocial}>
            {lookingUpSocial ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {parsedSocial && (
          <p className="text-xs text-muted-foreground">
            Detected: <Badge variant="outline" className="text-[10px] ml-1">{parsedSocial.platform}</Badge> @{parsedSocial.handle}
          </p>
        )}
        {socialUrl && !parsedSocial && (
          <p className="text-xs text-destructive">
            Paste a valid Instagram, Facebook, YouTube, or TikTok profile URL.
          </p>
        )}
        {socialCandidate && (
          <CandidateList candidates={[socialCandidate]} confirming={confirming} onConfirm={onConfirm} searching={false} />
        )}
        {!socialCandidate && !lookingUpSocial && (
          <p className="text-sm text-muted-foreground text-center py-3">
            Paste a direct link like instagram.com/brand or tiktok.com/@brand
          </p>
        )}
      </TabsContent>

      {/* Website URL Tab */}
      <TabsContent value="website" className="space-y-3 mt-3">
        <div className="flex gap-2">
          <Input
            placeholder="Paste business website URL..."
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDiscoverSocials()}
          />
          <Button onClick={handleDiscoverSocials} size="icon" variant="outline" disabled={discoverLoading || !websiteUrl.trim()}>
            {discoverLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          </Button>
        </div>
        {discoveredSocials ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Social profiles found:</p>
            {Object.entries(discoveredSocials).map(([platform, handle]) => {
              const Icon = PLATFORM_ICONS[platform] || Globe;
              return (
                <div key={platform} className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/20 transition-all">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">@{handle}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Found on {websiteUrl}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={confirming === handle ? "default" : "outline"}
                    onClick={() => handleConfirmDiscovered(platform, handle)}
                    disabled={confirming !== null}
                  >
                    {confirming === handle ? <Check className="h-4 w-4" /> : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : discoverLoading ? null : (
          <p className="text-sm text-muted-foreground text-center py-3">
            Enter a business website and we'll find their social profiles.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}

function CandidateList({ candidates, confirming, onConfirm, searching }: {
  candidates: CandidateProfile[];
  confirming: string | null;
  onConfirm: (c: CandidateProfile) => void;
  searching: boolean;
}) {
  if (candidates.length === 0) {
    if (searching) return null;
    return null;
  }
  return (
    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
      <p className="text-xs text-muted-foreground font-medium sticky top-0 bg-background py-1">Matching profiles:</p>
      {candidates.map((c) => (
        <div key={`${c.platform}-${c.handle}`} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${confirming === c.handle ? "border-emerald-500 bg-emerald-500/5" : "hover:border-primary/20"}`}>
          {c.avatarUrl ? (
            <img src={c.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-muted" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
              {c.displayName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate">{c.displayName}</span>
              <Badge variant="outline" className="text-[10px] shrink-0">{c.platform}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">@{c.handle} • {c.followers.toLocaleString()} followers</p>
            {c.bio && <p className="text-xs text-muted-foreground truncate">{c.bio}</p>}
          </div>
          <Button
            size="sm"
            variant={confirming === c.handle ? "default" : "outline"}
            className={confirming === c.handle ? "bg-emerald-500 hover:bg-emerald-600" : ""}
            onClick={() => onConfirm(c)}
            disabled={confirming !== null}
          >
            {confirming === c.handle ? <Check className="h-4 w-4" /> : "Confirm"}
          </Button>
        </div>
      ))}
    </div>
  );
}

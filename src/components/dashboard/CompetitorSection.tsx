import { useState } from "react";
import { Sparkles, Plus, Search, Check, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getScoreColor } from "@/data/mockScoreData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Competitor {
  name: string;
  score: number;
  change: number;
  source: "ai_suggested" | "manual";
}

interface CandidateProfile {
  handle: string;
  displayName: string;
  platform: string;
  followers: number;
  avatarUrl: string;
  bio: string;
}

interface Props {
  userScore: number;
  competitors: Competitor[];
  planTier: "free" | "premium";
}

export function CompetitorSection({ userScore, competitors, planTier }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const maxCompetitors = planTier === "premium" ? 10 : 2;
  const visibleCompetitors = competitors.slice(0, maxCompetitors);
  const canAdd = visibleCompetitors.length < maxCompetitors;

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

  const handleConfirmCompetitor = async (candidate: CandidateProfile) => {
    if (!user?.id) return;
    setConfirming(candidate.handle);
    try {
      const { data: cp, error: cpErr } = await supabase
        .from("competitor_profiles")
        .upsert(
          {
            platform: candidate.platform.toLowerCase() as any,
            handle: candidate.handle,
            display_name: candidate.displayName,
            follower_count: candidate.followers,
            scan_data: { bio: candidate.bio, avatar_url: candidate.avatarUrl },
          },
          { onConflict: "platform,handle" }
        )
        .select()
        .single();

      if (cpErr) throw cpErr;

      await supabase.from("user_competitors").insert({
        user_id: user.id,
        competitor_profile_id: cp.id,
        source: "manual" as const,
        confirmed: true,
      });

      toast({ title: "Competitor added!", description: `${candidate.displayName} is now being tracked.` });
      setShowAddDialog(false);
      setSearchQuery("");
      setCandidates([]);
      queryClient.invalidateQueries({ queryKey: ["userCompetitors"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add competitor.", variant: "destructive" });
    }
    setConfirming(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Competitor Landscape</CardTitle>
          <CardDescription>How you compare to tracked competitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-primary/10">
            <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold">Y</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">You</span>
                <span className="text-sm font-bold" style={{ color: getScoreColor(userScore) }}>{userScore}</span>
              </div>
              <Progress value={userScore} className="h-1.5 mt-1" />
            </div>
          </div>

          {/* Competitors */}
          {visibleCompetitors.map((c) => (
            <div key={c.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.name}</span>
                    {c.source === "ai_suggested" && (
                      <Badge variant="outline" className="text-[10px] gap-1 border-primary/20 text-primary">
                        <Sparkles className="h-3 w-3" /> AI Suggested
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${c.change > 0 ? "text-score-visible" : "text-destructive"}`}>
                      {c.change > 0 ? "+" : ""}{c.change}
                    </span>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(c.score) }}>{c.score}</span>
                  </div>
                </div>
                <Progress value={c.score} className="h-1.5 mt-1" />
              </div>
            </div>
          ))}

          {/* Competitor Gap Alerts */}
          {visibleCompetitors
            .filter((c) => c.score - userScore >= 15)
            .map((c) => (
              <div key={`alert-${c.name}`} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-sm">
                  <span className="text-destructive font-semibold">🔴 {c.name}</span> is outpacing you by{" "}
                  <strong>{c.score - userScore} points</strong>. They're capturing visibility you're losing.
                </p>
              </div>
            ))}

          {/* Add Competitor */}
          {canAdd && (
            <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" /> Add Competitor
            </Button>
          )}

          {!canAdd && planTier === "free" && (
            <p className="text-xs text-center text-muted-foreground">
              Free tier limited to 2 competitors. <button className="text-primary underline">Upgrade to Premium</button> for up to 10.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Competitor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Competitor</DialogTitle>
            <DialogDescription>Search for a business to verify their profile before tracking.</DialogDescription>
          </DialogHeader>

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

          {candidates.length > 0 ? (
            <div className="space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
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
                    onClick={() => handleConfirmCompetitor(c)}
                    disabled={confirming !== null}
                  >
                    {confirming === c.handle ? <Check className="h-4 w-4" /> : "Confirm"}
                  </Button>
                </div>
              ))}
            </div>
          ) : searching ? null : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Search to find competitors across Instagram, YouTube, TikTok, and Facebook.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

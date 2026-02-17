import { useState } from "react";
import { Sparkles, Plus, Search, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getScoreColor } from "@/data/mockScoreData";

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
  bio: string;
  avatar: string;
}

const MOCK_CANDIDATES: CandidateProfile[] = [
  { handle: "@freshbites_co", displayName: "Fresh Bites Co.", platform: "Instagram", followers: 24300, bio: "Organic snacks • Plant-based goodness 🌱", avatar: "F" },
  { handle: "@freshbites", displayName: "FreshBites Official", platform: "TikTok", followers: 18700, bio: "Snack videos & recipes", avatar: "F" },
  { handle: "@fresh_bites_brand", displayName: "Fresh Bites Brand", platform: "YouTube", followers: 9200, bio: "Weekly snack reviews and unboxings", avatar: "F" },
];

interface Props {
  userScore: number;
  competitors: Competitor[];
  planTier: "free" | "premium";
}

export function CompetitorSection({ userScore, competitors, planTier }: Props) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCandidates, setShowCandidates] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const maxCompetitors = planTier === "premium" ? 10 : 2;
  const visibleCompetitors = competitors.slice(0, maxCompetitors);
  const canAdd = visibleCompetitors.length < maxCompetitors;

  const handleSearch = () => {
    if (searchQuery.trim()) setShowCandidates(true);
  };

  const handleConfirm = (handle: string) => {
    setConfirmed(handle);
    setTimeout(() => {
      setShowAddDialog(false);
      setSearchQuery("");
      setShowCandidates(false);
      setConfirmed(null);
    }, 1200);
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
                {c.name.charAt(c.name.length - 1)}
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
                  <strong>{c.score - userScore} points</strong>. They're capturing visibility you're losing. See what they're doing differently in your monthly report.
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
              placeholder="Search business name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowCandidates(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {showCandidates && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-muted-foreground font-medium">Matching profiles:</p>
              {MOCK_CANDIDATES.map((c) => (
                <div key={c.handle} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${confirmed === c.handle ? "border-emerald-500 bg-emerald-500/5" : "hover:border-primary/20"}`}>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{c.displayName}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{c.platform}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.handle} • {c.followers.toLocaleString()} followers</p>
                    <p className="text-xs text-muted-foreground truncate">{c.bio}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={confirmed === c.handle ? "default" : "outline"}
                    className={confirmed === c.handle ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                    onClick={() => handleConfirm(c.handle)}
                    disabled={confirmed !== null}
                  >
                    {confirmed === c.handle ? <Check className="h-4 w-4" /> : "Confirm"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

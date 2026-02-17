import { useState } from "react";
import { X, Save, Send, Archive, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VERTICAL_COLORS, type Insight } from "@/data/mockInsights";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface Props {
  insight: Insight | null;
  onClose: () => void;
}

export function InsightDetailDrawer({ insight, onClose }: Props) {
  const [copy, setCopy] = useState("");
  const { toast } = useToast();

  // Sync copy when insight changes
  const currentCopy = insight ? copy || insight.newsletterCopy : "";

  const handleOpen = (open: boolean) => {
    if (!open) { setCopy(""); onClose(); }
  };

  const handleSaveDraft = () => {
    toast({ title: "Draft Saved", description: "Newsletter copy saved as draft." });
  };

  const handleSendToTemplate = () => {
    toast({ title: "Sent to Template Editor", description: "Copy has been sent to the template editor." });
  };

  const handleArchive = () => {
    toast({ title: "Archived", description: "Insight has been archived." });
    onClose();
  };

  const TrendIcon = ({ dir }: { dir?: "up" | "down" | "neutral" }) => {
    if (dir === "up") return <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--vertical-local))]" />;
    if (dir === "down") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <Sheet open={!!insight} onOpenChange={handleOpen}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        {insight && (
          <>
            <SheetHeader className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {insight.verticals.map((v) => (
                  <Badge key={v} className={`${VERTICAL_COLORS[v]} text-white border-0 text-xs`}>{v}</Badge>
                ))}
                <span className="text-xs text-muted-foreground ml-auto pt-1">
                  {new Date(insight.dateGenerated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <SheetTitle className="text-lg leading-tight">{insight.headline}</SheetTitle>
              <SheetDescription>Edit the newsletter copy below before sending to a template.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Editable Copy */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Newsletter Copy</label>
                <Textarea
                  value={currentCopy}
                  onChange={(e) => setCopy(e.target.value)}
                  className="min-h-[220px] font-mono text-sm leading-relaxed"
                  placeholder="Write your newsletter copy..."
                />
              </div>

              <Separator />

              {/* Supporting Data */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Supporting Data</h4>
                <div className="grid grid-cols-2 gap-3">
                  {insight.supportingData.map((d, i) => (
                    <Card key={i} className="border bg-muted/30">
                      <CardContent className="p-3">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{d.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-semibold text-foreground">{d.value}</span>
                          {d.change && (
                            <span className="flex items-center gap-0.5 text-xs">
                              <TrendIcon dir={d.changeDirection} />
                              {d.change}
                            </span>
                          )}
                          {!d.change && d.changeDirection && <TrendIcon dir={d.changeDirection} />}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {insight.chartData && (
                  <div className="h-[180px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insight.chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2 pb-4">
                <Button variant="outline" size="sm" onClick={handleSaveDraft}><Save className="h-4 w-4 mr-1" /> Save Draft</Button>
                <Button size="sm" onClick={handleSendToTemplate}><Send className="h-4 w-4 mr-1" /> Send to Template</Button>
                <Button variant="ghost" size="sm" onClick={handleArchive}><Archive className="h-4 w-4 mr-1" /> Archive</Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

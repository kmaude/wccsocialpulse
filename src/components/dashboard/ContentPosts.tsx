import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ContentPost } from "@/data/mockScoreData";

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸", TikTok: "🎵", YouTube: "▶️", Facebook: "📘",
};

function PostCard({ post }: { post: ContentPost }) {
  return (
    <Card className="border bg-muted/20 hover:bg-muted/40 transition-colors overflow-hidden">
      {post.thumbnailUrl && (
        <div className="relative w-full aspect-video bg-muted">
          <img
            src={post.thumbnailUrl}
            alt={post.content || "Post thumbnail"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
              {post.type}
            </Badge>
          </div>
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{PLATFORM_ICONS[post.platform]}</span>
            {!post.thumbnailUrl && <Badge variant="outline" className="text-[10px]">{post.type}</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</span>
        </div>
        <p className="text-sm line-clamp-2">{post.content}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Engagement: <strong className="text-foreground">{post.engagementRate}%</strong></span>
          <span>Reach: <strong className="text-foreground">{post.reach.toLocaleString()}</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  posts: ContentPost[];
  planTier: "free" | "premium";
}

export function ContentPosts({ posts, planTier }: Props) {
  const sorted = [...posts].sort((a, b) => b.engagementRate - a.engagementRate);
  const topCount = planTier === "premium" ? 10 : 3;
  const bottomCount = planTier === "premium" ? 10 : 3;

  const topPosts = sorted.slice(0, topCount);
  const bottomPosts = [...posts].sort((a, b) => a.engagementRate - b.engagementRate).slice(0, bottomCount);

  // For free tier, show blurred previews of extra posts
  const hasMoreTop = planTier === "free" && sorted.length > 3;
  const extraTopPosts = hasMoreTop ? sorted.slice(3, 6) : [];

  return (
    <div className="space-y-6">
      {/* Top Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <CardTitle className="font-display text-lg">Top Posts</CardTitle>
          </div>
          <CardDescription>Your best-performing content by engagement rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Blurred preview for free tier */}
          {hasMoreTop && (
            <div className="relative mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 blur-sm pointer-events-none select-none" aria-hidden>
                {extraTopPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg">
                <Button variant="outline" className="gap-2">
                  <Lock className="h-4 w-4" /> Upgrade to see all posts
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <CardTitle className="font-display text-lg">Bottom Posts</CardTitle>
          </div>
          <CardDescription>Content with the lowest engagement — opportunities to improve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bottomPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

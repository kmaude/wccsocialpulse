export type Vertical = "CPG" | "Local Services" | "Health & Wellness" | "Finance" | "Tech" | "Other";
export type InsightStatus = "New" | "Draft" | "Sent" | "Archived";

export interface Insight {
  id: string;
  headline: string;
  verticals: Vertical[];
  dateGenerated: string;
  status: InsightStatus;
  newsletterCopy: string;
  supportingData: {
    label: string;
    value: string;
    change?: string;
    changeDirection?: "up" | "down" | "neutral";
  }[];
  chartData?: { name: string; value: number }[];
}

export const VERTICAL_COLORS: Record<Vertical, string> = {
  "CPG": "bg-[hsl(var(--vertical-cpg))]",
  "Local Services": "bg-[hsl(var(--vertical-local))]",
  "Health & Wellness": "bg-[hsl(var(--vertical-health))]",
  "Finance": "bg-[hsl(var(--vertical-finance))]",
  "Tech": "bg-[hsl(var(--vertical-tech))]",
  "Other": "bg-[hsl(var(--vertical-other))]",
};

export const mockInsights: Insight[] = [
  {
    id: "ins-001",
    headline: "Short-Form Video Drives 3.2x More Engagement for CPG Brands",
    verticals: ["CPG"],
    dateGenerated: "2026-02-15",
    status: "New",
    newsletterCopy: `**Short-form video is dominating CPG brand visibility.**\n\nOur latest analysis across 240+ CPG brands reveals that accounts posting 4+ Reels or TikToks per week see **3.2x higher engagement rates** compared to those relying on static imagery.\n\nKey takeaway: If your feed is still photo-heavy, you're leaving visibility on the table. The algorithm rewards motion — and your competitors know it.\n\n**What to do now:**\n- Shift at least 50% of weekly posts to short-form video\n- Repurpose top-performing static content as motion graphics\n- Test behind-the-scenes and UGC-style clips for authenticity`,
    supportingData: [
      { label: "Avg Engagement (Video)", value: "4.8%", change: "+1.2%", changeDirection: "up" },
      { label: "Avg Engagement (Static)", value: "1.5%", change: "-0.3%", changeDirection: "down" },
      { label: "Brands Posting 4+ Reels/wk", value: "67%", change: "+12%", changeDirection: "up" },
      { label: "Avg Visibility Score (Video-Heavy)", value: "72", change: "+8", changeDirection: "up" },
    ],
    chartData: [
      { name: "Jan", value: 2.1 },
      { name: "Feb", value: 2.8 },
      { name: "Mar", value: 3.4 },
      { name: "Apr", value: 3.9 },
      { name: "May", value: 4.2 },
      { name: "Jun", value: 4.8 },
    ],
  },
  {
    id: "ins-002",
    headline: "Local Service Brands Losing Ground on Google Business Visibility",
    verticals: ["Local Services"],
    dateGenerated: "2026-02-14",
    status: "Draft",
    newsletterCopy: `**Your Google Business Profile might be costing you customers.**\n\nAcross 180 local service brands tracked in Social Pulse, those with incomplete or stale Google Business Profiles scored **22 points lower** on average in our Visibility Index.\n\nThe fix is straightforward but often overlooked:\n\n- Update your hours, photos, and services quarterly\n- Respond to every review within 48 hours\n- Post weekly updates directly on your Google profile`,
    supportingData: [
      { label: "Avg Score (Complete Profile)", value: "64", change: "+5", changeDirection: "up" },
      { label: "Avg Score (Incomplete)", value: "42", change: "-3", changeDirection: "down" },
      { label: "Review Response Rate", value: "34%", change: "-8%", changeDirection: "down" },
      { label: "Brands with Weekly Posts", value: "18%", change: "+4%", changeDirection: "up" },
    ],
    chartData: [
      { name: "Complete", value: 64 },
      { name: "Partial", value: 51 },
      { name: "Stale", value: 42 },
      { name: "None", value: 28 },
    ],
  },
  {
    id: "ins-003",
    headline: "Cross-Platform Posting Consistency Predicts Higher Scores",
    verticals: ["CPG", "Tech", "Health & Wellness"],
    dateGenerated: "2026-02-13",
    status: "Sent",
    newsletterCopy: `**Consistency across platforms is the hidden multiplier.**\n\nBrands that maintain a consistent posting cadence across 3+ platforms score **18 points higher** on the Visibility Index than those concentrated on a single channel.\n\nThis isn't about being everywhere — it's about showing up reliably where your audience already is.`,
    supportingData: [
      { label: "Avg Score (3+ Platforms)", value: "71", change: "+4", changeDirection: "up" },
      { label: "Avg Score (1 Platform)", value: "53", change: "-2", changeDirection: "down" },
      { label: "Cross-Platform Brands", value: "41%", change: "+7%", changeDirection: "up" },
      { label: "Engagement Lift", value: "+34%", changeDirection: "up" },
    ],
  },
  {
    id: "ins-004",
    headline: "Finance Brands See 45% Drop in Organic Reach After Algorithm Shift",
    verticals: ["Finance"],
    dateGenerated: "2026-02-10",
    status: "Archived",
    newsletterCopy: `**The latest algorithm changes hit finance content hardest.**\n\nFinance-vertical brands on Instagram experienced a **45% median decline** in organic reach over the past 60 days. Educational carousel content was particularly affected.\n\nAdaptation strategies that are working:\n- Shift to conversational Reels (ask questions, polls)\n- Collaborate with micro-influencers in adjacent niches\n- Diversify to YouTube Shorts and TikTok immediately`,
    supportingData: [
      { label: "Median Reach Decline", value: "-45%", changeDirection: "down" },
      { label: "Carousel Reach Drop", value: "-62%", changeDirection: "down" },
      { label: "Reels Reach Change", value: "-12%", changeDirection: "down" },
      { label: "TikTok Reach Change", value: "+18%", changeDirection: "up" },
    ],
  },
  {
    id: "ins-005",
    headline: "Health & Wellness Brands with UGC See 2x Follower Growth",
    verticals: ["Health & Wellness"],
    dateGenerated: "2026-02-12",
    status: "New",
    newsletterCopy: `**User-generated content is the growth engine for wellness brands.**\n\nBrands in the Health & Wellness vertical that feature UGC in at least 30% of their posts are growing followers at **2x the rate** of those relying solely on branded content.\n\nThe authenticity factor cannot be overstated — audiences trust real people over polished brand messaging.`,
    supportingData: [
      { label: "Follower Growth (UGC-Heavy)", value: "+8.2%/mo", changeDirection: "up" },
      { label: "Follower Growth (Branded Only)", value: "+3.9%/mo", changeDirection: "up" },
      { label: "UGC Engagement Rate", value: "5.1%", change: "+1.8%", changeDirection: "up" },
      { label: "Branded Engagement Rate", value: "2.3%", change: "-0.2%", changeDirection: "down" },
    ],
  },
  {
    id: "ins-006",
    headline: "Tech Startups Underinvesting in LinkedIn See Competitor Gaps Widen",
    verticals: ["Tech"],
    dateGenerated: "2026-02-11",
    status: "New",
    newsletterCopy: `**LinkedIn is the sleeper platform for B2B tech visibility.**\n\nTech brands that post 3+ times per week on LinkedIn show a **26-point higher** Visibility Score versus those posting once or less. The competitor velocity gap is widening for brands ignoring this channel.`,
    supportingData: [
      { label: "Avg Score (Active LinkedIn)", value: "68", changeDirection: "up" },
      { label: "Avg Score (Inactive LinkedIn)", value: "42", changeDirection: "down" },
      { label: "Competitor Gap (Active)", value: "Closing", changeDirection: "up" },
      { label: "Competitor Gap (Inactive)", value: "Widening", changeDirection: "down" },
    ],
  },
];

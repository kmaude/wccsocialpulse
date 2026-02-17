export interface TemplateBlock {
  id: string;
  type: "header" | "body" | "cta" | "footer" | "divider";
  content: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  lastEdited: string;
  timesUsed: number;
  avgOpenRate: number;
  status: "active" | "draft";
  blocks: TemplateBlock[];
}

export const MERGE_TAGS = [
  "{{first_name}}",
  "{{business_name}}",
  "{{visibility_score}}",
  "{{score_change}}",
  "{{top_post}}",
  "{{competitor_name}}",
  "{{vertical}}",
  "{{month}}",
];

export const mockTemplates: EmailTemplate[] = [
  {
    id: "tpl-001",
    name: "Monthly Report",
    lastEdited: "2026-02-10",
    timesUsed: 14,
    avgOpenRate: 41.2,
    status: "active",
    blocks: [
      { id: "b1", type: "header", content: "Your {{month}} Visibility Report" },
      { id: "b2", type: "body", content: "Hi {{first_name}},\n\nYour Visibility Score this month is **{{visibility_score}}** — here's what moved the needle." },
      { id: "b3", type: "body", content: "**Top Performing Post:**\n{{top_post}}\n\nThis post drove the most engagement in your scoring window." },
      { id: "b4", type: "cta", content: "View Full Report →" },
      { id: "b5", type: "footer", content: "Social Pulse by West Coast Content Company\nManage preferences | Unsubscribe" },
    ],
  },
  {
    id: "tpl-002",
    name: "Score Alert",
    lastEdited: "2026-02-05",
    timesUsed: 6,
    avgOpenRate: 65.8,
    status: "active",
    blocks: [
      { id: "b1", type: "header", content: "⚠️ Your Visibility Score Changed" },
      { id: "b2", type: "body", content: "Hi {{first_name}},\n\nYour score moved by **{{score_change}}** points this period. Here's what happened and what you can do about it." },
      { id: "b3", type: "cta", content: "See What Changed →" },
      { id: "b4", type: "footer", content: "Social Pulse by West Coast Content Company\nManage preferences | Unsubscribe" },
    ],
  },
  {
    id: "tpl-003",
    name: "Welcome",
    lastEdited: "2026-01-20",
    timesUsed: 156,
    avgOpenRate: 72.8,
    status: "active",
    blocks: [
      { id: "b1", type: "header", content: "Welcome to Social Pulse 👋" },
      { id: "b2", type: "body", content: "Hi {{first_name}},\n\nWe're computing your first Visibility Score now. This usually takes about an hour.\n\nIn the meantime, here's what Social Pulse will show you:" },
      { id: "b3", type: "body", content: "✅ Your Visibility Score (0–100)\n✅ How you compare to competitors\n✅ Which content is working (and what isn't)\n✅ Actionable recommendations" },
      { id: "b4", type: "cta", content: "Explore Your Dashboard →" },
      { id: "b5", type: "footer", content: "Social Pulse by West Coast Content Company\nManage preferences | Unsubscribe" },
    ],
  },
  {
    id: "tpl-004",
    name: "Mid-Cycle Engagement",
    lastEdited: "2026-02-01",
    timesUsed: 8,
    avgOpenRate: 34.2,
    status: "active",
    blocks: [
      { id: "b1", type: "header", content: "Quick Insight for {{business_name}}" },
      { id: "b2", type: "body", content: "Hi {{first_name}},\n\nHere's a mid-month insight that could impact your visibility:" },
      { id: "b3", type: "cta", content: "Read More Insights →" },
      { id: "b4", type: "footer", content: "Social Pulse by West Coast Content Company\nManage preferences | Unsubscribe" },
    ],
  },
  {
    id: "tpl-005",
    name: "Premium Upsell",
    lastEdited: "2026-01-15",
    timesUsed: 3,
    avgOpenRate: 28.4,
    status: "draft",
    blocks: [
      { id: "b1", type: "header", content: "Unlock the Full Picture" },
      { id: "b2", type: "body", content: "Hi {{first_name}},\n\nYou've been using Social Pulse for a few months now. Ready to go deeper?\n\nWith Premium ($29/mo), you get:\n- 10 competitors tracked\n- Weekly score updates\n- AI-powered recommendations\n- 24-month historical data" },
      { id: "b3", type: "cta", content: "Upgrade to Premium →" },
      { id: "b4", type: "footer", content: "Social Pulse by West Coast Content Company\nManage preferences | Unsubscribe" },
    ],
  },
];

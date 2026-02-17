export type EmailType = "Monthly Report" | "Mid-Cycle" | "Score Alert" | "Welcome" | "Upsell" | "Re-engagement";

export interface SentEmail {
  id: string;
  subject: string;
  template: string;
  type: EmailType;
  sendDate: string;
  recipientCount: number;
  openRate: number;
  clickRate: number;
  vertical: string;
}

export const mockEmails: SentEmail[] = [
  { id: "em-001", subject: "Your February Visibility Report is Ready", template: "Monthly Report v3", type: "Monthly Report", sendDate: "2026-02-01", recipientCount: 1243, openRate: 42.3, clickRate: 8.7, vertical: "All" },
  { id: "em-002", subject: "Your Score Dropped 12 Points — Here's Why", template: "Score Alert v2", type: "Score Alert", sendDate: "2026-02-05", recipientCount: 87, openRate: 68.2, clickRate: 22.1, vertical: "CPG" },
  { id: "em-003", subject: "Mid-Month Insight: Video Is Eating Static Content", template: "Mid-Cycle v1", type: "Mid-Cycle", sendDate: "2026-02-15", recipientCount: 892, openRate: 35.6, clickRate: 6.4, vertical: "All" },
  { id: "em-004", subject: "Welcome to Social Pulse — Your First Score is Computing", template: "Welcome v4", type: "Welcome", sendDate: "2026-02-10", recipientCount: 156, openRate: 72.8, clickRate: 31.2, vertical: "All" },
  { id: "em-005", subject: "Unlock Competitor Intelligence with Premium", template: "Upsell v2", type: "Upsell", sendDate: "2026-02-12", recipientCount: 445, openRate: 28.4, clickRate: 4.8, vertical: "All" },
  { id: "em-006", subject: "We Miss You — Your Competitors Haven't Slowed Down", template: "Re-engagement v1", type: "Re-engagement", sendDate: "2026-02-08", recipientCount: 234, openRate: 31.7, clickRate: 9.3, vertical: "All" },
  { id: "em-007", subject: "Local Service Brands: Your Visibility Playbook", template: "Monthly Report v3", type: "Monthly Report", sendDate: "2026-02-01", recipientCount: 312, openRate: 44.1, clickRate: 11.2, vertical: "Local Services" },
  { id: "em-008", subject: "January Visibility Report — CPG Edition", template: "Monthly Report v3", type: "Monthly Report", sendDate: "2026-01-01", recipientCount: 1180, openRate: 39.8, clickRate: 7.9, vertical: "CPG" },
];



# Admin Dashboard: Industry Insights & Email Management

## Feature 1: Industry Insights Hub (New Admin Tab)

### Insights List View
- Tabbed or filterable list of AI-generated industry insights (headlines/hooks)
- Each row displays:
  - **Headline/hook** (clickable)
  - **Vertical badge(s)** (CPG, Local Services, etc.) — color-coded chips
  - **Date generated**
  - **Status** indicator (New, Draft, Sent, Archived)
- Filter bar: filter by vertical, status, date range
- Search across headlines
- Sort by date, vertical, or status

### Insight Detail Panel (Slide-over / Dialog)
- Opens when clicking a headline
- **Top section**: Vertical tag(s) + generated date
- **Newsletter Copy** — rich-text editable area pre-populated with AI-generated copy based on the insight. User can edit formatting, wording, and tone before it goes into an email
- **Supporting Data** — below the copy area, displays the underlying metrics/data that informed the insight (charts, stat cards, data points from the scoring engine)
- **Actions**: "Save Draft", "Send to Template Editor", "Archive"

## Feature 2: Email Analytics

### Open Rate Dashboard
- Table/cards showing sent emails with:
  - Email subject line
  - Template used
  - Send date
  - Recipient count
  - **Open rate** (percentage + bar)
  - Click rate
  - Vertical targeted
- Filter by email type (Monthly Report, Mid-Cycle, Upsell, etc.) and date range
- Summary stats at top: average open rate, best performing email, total sends

## Feature 3: Email Template Editor

### Template List
- List of email templates (Monthly Report, Score Alert, Welcome, Mid-Cycle, etc.)
- Each shows: template name, last edited date, times used, average open rate

### Template Editor View
- Visual block-based editor for email templates
- Editable sections: header, body blocks, CTA buttons, footer
- **Merge tags** support: `{{first_name}}`, `{{visibility_score}}`, `{{top_post}}`, `{{competitor_name}}`, etc.
- Preview pane showing rendered email (desktop + mobile toggle)
- "Insert Insight" button — pulls in copy from an Industry Insight directly into a template block
- Save as draft, activate template, duplicate template

## How It All Connects
1. System generates **Industry Insights** from aggregated scoring data
2. Admin reviews insights, edits the newsletter copy in the detail panel
3. Admin sends edited copy to the **Template Editor** where it gets placed into an email layout
4. Emails are sent via the existing Resend pipeline
5. **Open rates** and engagement flow back into the Email Analytics view

## Pages & Navigation
- Admin Dashboard gets new tabs/sections:
  - **Industry Insights** — the insights list + detail panel
  - **Email Templates** — template list + editor
  - **Email Analytics** — open rate tracking dashboard

## Design Approach
- Modern & minimal consistent with the rest of the app
- Insight detail opens as a **slide-over drawer** from the right (keeps context of the list visible)
- Editable copy uses a clean textarea/rich-text area — not a full WYSIWYG, just enough formatting (bold, italic, links, line breaks)
- Template editor uses a card-based block layout — drag to reorder sections
- Vertical badges use consistent color coding throughout (same colors in insights list, detail panel, email analytics)



CREATE TABLE public.scan_rate_limits (
  ip TEXT PRIMARY KEY,
  scan_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scan_rate_limits ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.posts ADD CONSTRAINT posts_user_platform_external_unique 
  UNIQUE NULLS NOT DISTINCT (user_id, platform, external_id);

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS next_monthly_report_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_midcycle_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_weekly_report_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMPTZ;

UPDATE public.profiles 
SET next_monthly_report_date = created_at + interval '30 days',
    next_midcycle_date = created_at + interval '15 days'
WHERE next_monthly_report_date IS NULL;

CREATE OR REPLACE FUNCTION public.set_report_dates()
RETURNS TRIGGER AS $$
BEGIN
  NEW.next_monthly_report_date := NEW.created_at + interval '30 days';
  NEW.next_midcycle_date := NEW.created_at + interval '15 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS set_report_dates_on_insert ON public.profiles;
CREATE TRIGGER set_report_dates_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_report_dates();

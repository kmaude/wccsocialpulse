
-- Enums
CREATE TYPE public.vertical_type AS ENUM ('CPG', 'Local Services', 'Other');
CREATE TYPE public.plan_tier AS ENUM ('free', 'premium');
CREATE TYPE public.platform_type AS ENUM ('instagram', 'facebook', 'tiktok', 'youtube');
CREATE TYPE public.connection_status AS ENUM ('connected', 'collecting', 'active', 'error');
CREATE TYPE public.data_source_type AS ENUM ('analytics_db', 'real_time_scrape', 'oauth');
CREATE TYPE public.content_type AS ENUM ('image', 'video', 'carousel', 'story', 'reel', 'short', 'text');
CREATE TYPE public.competitor_source AS ENUM ('ai_suggested', 'manual');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  business_name TEXT,
  email TEXT,
  vertical public.vertical_type,
  plan_tier public.plan_tier NOT NULL DEFAULT 'free',
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  tos_accepted_at TIMESTAMPTZ,
  tos_version_id TEXT,
  stripe_customer_id TEXT,
  subscription_status TEXT,
  last_login TIMESTAMPTZ,
  last_email_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate table per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Connections (platform OAuth tokens)
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform public.platform_type NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_version INTEGER NOT NULL DEFAULT 1,
  data_active_date TIMESTAMPTZ,
  status public.connection_status NOT NULL DEFAULT 'connected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scores
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall INTEGER NOT NULL CHECK (overall >= 0 AND overall <= 100),
  sub_scores JSONB,
  data_source public.data_source_type,
  ai_summary TEXT,
  ai_recommendations JSONB,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Competitor profiles (global dedup table)
CREATE TABLE public.competitor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform public.platform_type NOT NULL,
  handle TEXT NOT NULL,
  display_name TEXT,
  follower_count INTEGER,
  last_scanned_at TIMESTAMPTZ,
  scan_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, handle)
);

-- User competitors (junction)
CREATE TABLE public.user_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competitor_profile_id UUID NOT NULL REFERENCES public.competitor_profiles(id) ON DELETE CASCADE,
  source public.competitor_source NOT NULL DEFAULT 'manual',
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, competitor_profile_id)
);

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform public.platform_type NOT NULL,
  external_id TEXT,
  content_type public.content_type,
  content_snippet TEXT,
  published_at TIMESTAMPTZ,
  metrics JSONB,
  ai_score INTEGER CHECK (ai_score IS NULL OR (ai_score >= 0 AND ai_score <= 100)),
  ai_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security definer function for role checking (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- CONNECTIONS policies
CREATE POLICY "Users can manage own connections" ON public.connections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SCORES policies
CREATE POLICY "Users can view own scores" ON public.scores
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.scores
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all scores" ON public.scores
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- COMPETITOR_PROFILES policies (readable by all authenticated)
CREATE POLICY "Authenticated users can view competitors" ON public.competitor_profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage competitors" ON public.competitor_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- USER_COMPETITORS policies
CREATE POLICY "Users can manage own competitor links" ON public.user_competitors
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- POSTS policies
CREATE POLICY "Users can manage own posts" ON public.posts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AUDIT_LOG policies
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view audit logs" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_connections_user_id ON public.connections(user_id);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_user_competitors_user_id ON public.user_competitors(user_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

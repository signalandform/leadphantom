-- Lead Phantom initial schema + RLS (multitenant: all app tables use `_lp` suffix)
-- TODO: Rotate secrets via Supabase Vault / external KMS for api_credentials_lp.encrypted_key

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.profiles_lp (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  company_name TEXT,
  industry TEXT,
  sheet_url TEXT,
  -- TODO: Encrypt at rest via Vault/KMS; column stores plaintext or app-encrypted blob for demo only.
  google_api_key TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.lead_searches_lp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query_text TEXT NOT NULL,
  location_bias TEXT,
  radius_meters INTEGER,
  status TEXT NOT NULL DEFAULT 'idle',
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX lead_searches_lp_user_id_idx ON public.lead_searches_lp (user_id);

CREATE TABLE public.lead_locations_lp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES public.lead_searches_lp (id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  name TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  rating DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'active',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (search_id, place_id)
);

CREATE INDEX lead_locations_lp_search_id_idx ON public.lead_locations_lp (search_id);

CREATE TABLE public.lead_exports_lp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES public.lead_searches_lp (id) ON DELETE CASCADE,
  sheet_url TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB
);

CREATE INDEX lead_exports_lp_search_id_idx ON public.lead_exports_lp (search_id);

CREATE TABLE public.api_credentials_lp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  -- TODO: Prefer Supabase Vault or external KMS; never log this value.
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider)
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles_lp (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles_lp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_searches_lp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_locations_lp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_exports_lp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_credentials_lp ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_lp_select_own ON public.profiles_lp FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_lp_update_own ON public.profiles_lp FOR UPDATE USING (id = auth.uid());

CREATE POLICY lead_searches_lp_select_own ON public.lead_searches_lp FOR SELECT USING (user_id = auth.uid());
CREATE POLICY lead_searches_lp_insert_own ON public.lead_searches_lp FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY lead_searches_lp_update_own ON public.lead_searches_lp FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY lead_searches_lp_delete_own ON public.lead_searches_lp FOR DELETE USING (user_id = auth.uid());

CREATE POLICY lead_locations_lp_select_own ON public.lead_locations_lp FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lead_searches_lp s
    WHERE s.id = lead_locations_lp.search_id AND s.user_id = auth.uid()
  )
);
CREATE POLICY lead_locations_lp_insert_own ON public.lead_locations_lp FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lead_searches_lp s
    WHERE s.id = lead_locations_lp.search_id AND s.user_id = auth.uid()
  )
);
CREATE POLICY lead_locations_lp_update_own ON public.lead_locations_lp FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.lead_searches_lp s
    WHERE s.id = lead_locations_lp.search_id AND s.user_id = auth.uid()
  )
);
CREATE POLICY lead_locations_lp_delete_own ON public.lead_locations_lp FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.lead_searches_lp s
    WHERE s.id = lead_locations_lp.search_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY lead_exports_lp_select_own ON public.lead_exports_lp FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lead_searches_lp s
    WHERE s.id = lead_exports_lp.search_id AND s.user_id = auth.uid()
  )
);
CREATE POLICY lead_exports_lp_insert_own ON public.lead_exports_lp FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lead_searches_lp s
    WHERE s.id = lead_exports_lp.search_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY api_credentials_lp_select_own ON public.api_credentials_lp FOR SELECT USING (user_id = auth.uid());
CREATE POLICY api_credentials_lp_insert_own ON public.api_credentials_lp FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY api_credentials_lp_update_own ON public.api_credentials_lp FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY api_credentials_lp_delete_own ON public.api_credentials_lp FOR DELETE USING (user_id = auth.uid());

-- Oculus Advisor Platform — Database Schema
-- All tables use UUID primary keys, TIMESTAMPTZ for timestamps,
-- JSONB for complex objects, and RLS for row-level security.

-- ---- Updated At Trigger Function ----
-- Shared trigger to auto-set updated_at on every UPDATE.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---- Clients Table ----

CREATE TABLE IF NOT EXISTS public.clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  status          TEXT NOT NULL DEFAULT 'lead'
                    CHECK (status IN ('lead', 'onboarding', 'active', 'review', 'churned')),
  archetype       TEXT NOT NULL
                    CHECK (archetype IN (
                      'systems_builder',
                      'reassurance_seeker',
                      'analytical_skeptic',
                      'diy_controller',
                      'collaborative_partner',
                      'big_picture_optimist',
                      'trend_sensitive_explorer',
                      'avoider_under_stress',
                      'action_first_decider',
                      'values_anchored_steward'
                    )),
  dna_profile     JSONB NOT NULL DEFAULT '{}',
  aum             NUMERIC(18, 2) NOT NULL DEFAULT 0,
  risk_score      SMALLINT NOT NULL DEFAULT 0
                    CHECK (risk_score >= 0 AND risk_score <= 100),
  brand_color     TEXT NOT NULL DEFAULT '#006DD8',
  notes           TEXT,
  last_contact_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_status    ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_archetype ON public.clients(archetype);
CREATE INDEX IF NOT EXISTS idx_clients_email     ON public.clients(email);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Advisors can view all clients in their workspace.
-- Auth integration: replace auth.uid() checks with workspace/org logic as needed.
CREATE POLICY "Authenticated users can view clients"
  ON public.clients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update clients"
  ON public.clients FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete clients"
  ON public.clients FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ---- Client Notes Table ----

CREATE TABLE IF NOT EXISTS public.client_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'general'
               CHECK (type IN ('general', 'meeting', 'call', 'compliance', 'review')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client_id  ON public.client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON public.client_notes(created_at DESC);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notes"
  ON public.client_notes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert notes"
  ON public.client_notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update notes"
  ON public.client_notes FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete notes"
  ON public.client_notes FOR DELETE
  USING (auth.role() = 'authenticated');

-- ---- Portfolio Holdings Table ----

CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  ticker         TEXT NOT NULL,
  name           TEXT NOT NULL,
  shares         NUMERIC(18, 6) NOT NULL DEFAULT 0,
  price          NUMERIC(18, 4) NOT NULL DEFAULT 0,
  value          NUMERIC(18, 2) NOT NULL DEFAULT 0,
  allocation_pct NUMERIC(5, 2) NOT NULL DEFAULT 0
                   CHECK (allocation_pct >= 0 AND allocation_pct <= 100),
  asset_class    TEXT NOT NULL,
  sector         TEXT
);

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_client_id ON public.portfolio_holdings(client_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_ticker    ON public.portfolio_holdings(ticker);

ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view holdings"
  ON public.portfolio_holdings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert holdings"
  ON public.portfolio_holdings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update holdings"
  ON public.portfolio_holdings FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete holdings"
  ON public.portfolio_holdings FOR DELETE
  USING (auth.role() = 'authenticated');

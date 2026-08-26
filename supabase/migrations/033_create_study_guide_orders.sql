-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 033: Study guide orders (rubyaitutor.com/matrics purchases)
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- Records who bought which study guides from which school. Written once
-- PayFast confirms payment in app/api/payfast/notify/route.ts.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.study_guide_orders (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text        NOT NULL,
  school              text        NOT NULL,
  guide_ids           text[]      NOT NULL DEFAULT '{}',
  guide_names         text[]      NOT NULL DEFAULT '{}',
  amount              numeric(10,2) NOT NULL,
  payfast_payment_id  text,                        -- pf_payment_id from ITN
  paid_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS study_guide_orders_email_idx ON public.study_guide_orders(email);
CREATE INDEX IF NOT EXISTS study_guide_orders_school_idx ON public.study_guide_orders(school);

-- RLS: no public access at all — only the service-role key (used server-side
-- by the ITN webhook and any future admin tooling) can read or write.
ALTER TABLE public.study_guide_orders ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006: Plans catalogue table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.plans (
  key          text        PRIMARY KEY,                -- 'free' | 'starter' | 'pro' | 'ultimate' | 'school'
  label        text        NOT NULL,
  price_rands  numeric(10,2) NOT NULL DEFAULT 0,       -- 0 = free
  billing_interval text    NOT NULL DEFAULT 'month',   -- 'month' | 'none'
  features     text[]      NOT NULL DEFAULT '{}',
  is_active    boolean     NOT NULL DEFAULT true,
  sort_order   int         NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Seed plans
INSERT INTO public.plans (key, label, price_rands, billing_interval, features, sort_order) VALUES
  (
    'free',
    'Free Trial',
    0,
    'none',
    ARRAY['Limited questions per day', 'Maths Engine', 'Reading Engine'],
    0
  ),
  (
    'starter',
    'Starter',
    149.00,
    'month',
    ARRAY['Maths Engine', 'Reading Engine', 'Progress Reports', 'General Homework Chat'],
    1
  ),
  (
    'pro',
    'Pro',
    299.00,
    'month',
    ARRAY['Everything in Starter', 'Unlimited questions', 'PDF Reports', 'Priority support'],
    2
  ),
  (
    'ultimate',
    'Ultimate',
    499.00,
    'month',
    ARRAY['Everything in Pro', 'Multiple learner profiles', 'Parent dashboard', 'Live tutor sessions'],
    3
  ),
  (
    'school',
    'School',
    0,
    'none',
    ARRAY['Managed by institution', 'Unlimited learners', 'Admin dashboard', 'Dedicated support'],
    4
  )
ON CONFLICT (key) DO NOTHING;

-- RLS: plans are public (anyone can read, no writes via client)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_public_read"
  ON public.plans FOR SELECT
  USING (true);

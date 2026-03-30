-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: PayFast recurring billing support
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add payfast_token to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payfast_token text;

-- 2. Expand plan check constraint to include all tiers
--    (original only had 'free', 'pro', 'school')

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultimate', 'school'));

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultimate', 'school'));

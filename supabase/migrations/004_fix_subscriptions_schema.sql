-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Ensure subscriptions table matches ITN requirements
-- Safe to run multiple times (idempotent)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add payfast_token column if missing
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payfast_token text;

-- 2. Add trial_expires_at to users if missing (from migration 003)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_expires_at timestamptz;

-- 3. Fix plan check constraint on subscriptions to include all tiers
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultimate', 'school'));

-- 4. Fix plan check constraint on users to include all tiers
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultimate', 'school'));

-- 5. Allow service-role to bypass RLS on subscriptions and users
DROP POLICY IF EXISTS "service_role_subscriptions" ON public.subscriptions;
CREATE POLICY "service_role_subscriptions"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_users" ON public.users;
CREATE POLICY "service_role_users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

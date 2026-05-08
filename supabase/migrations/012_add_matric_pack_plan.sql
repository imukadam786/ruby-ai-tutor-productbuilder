-- Migration 012: Add matric-pack to plan check constraints and plans catalogue
-- The ITN webhook was silently failing when trying to set plan = 'matric-pack'
-- because the check constraint did not include that value.
-- Run in: Supabase Dashboard → SQL Editor → New Query

-- Drop and re-add the users.plan constraint to include matric-pack
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%plan%'
  LOOP
    EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.users
  ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultimate', 'school', 'scholar', 'master', 'matric-pack'))
  NOT VALID;

-- Drop and re-add the subscriptions.plan constraint to include matric-pack
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.subscriptions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%plan%'
  LOOP
    EXECUTE 'ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultimate', 'school', 'scholar', 'master', 'matric-pack'))
  NOT VALID;

-- Ensure matric-pack exists in the plans catalogue (idempotent)
INSERT INTO public.plans (key, label, price_rands, billing_interval, features, sort_order)
VALUES (
  'matric-pack',
  'Matric Exam Pack',
  0,
  'none',
  ARRAY['Full matric past papers', 'Step-by-step AI tutoring', 'Access until 30 June 2026'],
  10
)
ON CONFLICT (key) DO NOTHING;

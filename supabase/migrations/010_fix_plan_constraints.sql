-- Migration 010: Replace hardcoded plan check constraints with the full set
-- including scholar and master. Uses NOT VALID to skip existing row scanning
-- (existing rows are valid — the prior constraint was too narrow).
-- Run in: Supabase Dashboard → SQL Editor → New Query

-- Drop ALL check constraints on subscriptions.plan (named + any auto-named)
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

-- Drop ALL check constraints on users.plan (named + any auto-named)
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

-- Add updated constraints (NOT VALID skips scanning existing rows)
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultimate', 'school', 'scholar', 'master', 'matric-pack'))
  NOT VALID;

ALTER TABLE public.users
  ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultimate', 'school', 'scholar', 'master', 'matric-pack'))
  NOT VALID;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 034: Add school to users table
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- Stores the school name a learner optionally types during sign-up. Optional —
-- left null when the learner skips it (homeschoolers, or anyone who doesn't
-- know the exact registered name). Free text, no validation.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.users
  add column if not exists school text;

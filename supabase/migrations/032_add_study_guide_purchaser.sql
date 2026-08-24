-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 032: Add study_guide_purchaser to users table
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- Marks accounts created via the 4-guide matric bundle redirect
-- (rubyaitutor.com/matrics → ?StudyGuidePurchaser=true). These users skip
-- the free trial and land straight on plan selection, and the paywall
-- screen shows different copy for them.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS study_guide_purchaser boolean NOT NULL DEFAULT false;

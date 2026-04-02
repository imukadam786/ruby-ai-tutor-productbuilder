-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Add trial_expires_at to users table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_expires_at timestamptz;

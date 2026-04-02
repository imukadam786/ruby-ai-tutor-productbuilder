-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Payments table for billing history
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payfast_payment_id text,                        -- pf_payment_id from ITN
  amount            numeric(10,2) NOT NULL,
  plan              text        NOT NULL,
  status            text        NOT NULL DEFAULT 'complete',
  paid_at           timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);

-- RLS: users can only read their own payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

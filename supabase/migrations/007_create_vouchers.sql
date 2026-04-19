-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Vouchers and redemption tracking
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Vouchers catalogue
CREATE TABLE IF NOT EXISTS public.vouchers (
  code            text          PRIMARY KEY,                     -- e.g. "RUBY20"
  discount_type   text          NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  numeric(10,2) NOT NULL CHECK (discount_value > 0),
  applicable_plans text[]       NOT NULL DEFAULT '{}',           -- empty = all paid plans
  max_uses        int,                                           -- null = unlimited
  used_count      int           NOT NULL DEFAULT 0,
  expires_at      timestamptz,                                   -- null = never expires
  is_active       boolean       NOT NULL DEFAULT true,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

-- 2. Redemption log — one row per successful payment that used a voucher
CREATE TABLE IF NOT EXISTS public.voucher_redemptions (
  id            bigserial   PRIMARY KEY,
  voucher_code  text        NOT NULL REFERENCES public.vouchers(code),
  user_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan          text        NOT NULL,
  redeemed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voucher_redemptions_voucher_idx ON public.voucher_redemptions(voucher_code);
CREATE INDEX IF NOT EXISTS voucher_redemptions_user_idx    ON public.voucher_redemptions(user_id);

-- 3. Helper function to atomically increment used_count (avoids race conditions)
CREATE OR REPLACE FUNCTION public.increment_voucher_use(voucher_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.vouchers
  SET used_count = used_count + 1
  WHERE code = voucher_code;
END;
$$;

-- 4. RLS — vouchers are publicly readable (needed for client-side validation UX)
--         but only service_role can write
ALTER TABLE public.vouchers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_redemptions   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouchers_public_read"
  ON public.vouchers FOR SELECT
  USING (true);

CREATE POLICY "voucher_redemptions_service_role"
  ON public.voucher_redemptions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Users can see their own redemptions
CREATE POLICY "voucher_redemptions_own_read"
  ON public.voucher_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Example vouchers (remove or adjust before production)
INSERT INTO public.vouchers (code, discount_type, discount_value, applicable_plans, max_uses) VALUES
  ('RUBY20',   'percentage', 20,    '{}',           null),
  ('STARTER50', 'fixed',     50.00, '{starter}',    100),
  ('LAUNCH',   'percentage', 15,    '{}',           500)
ON CONFLICT (code) DO NOTHING;

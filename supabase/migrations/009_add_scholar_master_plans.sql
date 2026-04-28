-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009: Add Scholar and Master plans
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.plans (key, label, price_rands, billing_interval, features, sort_order) VALUES
  (
    'scholar',
    'Scholar',
    99.00,
    'month',
    ARRAY['CAPS Aligned curriculum', '2× Discovery Activities', '2× Discovery Reports', 'Full Personalised Skills Worksheets', 'Unlimited AI Homework Assist', 'Unlimited hints', 'Home Language Feedback', 'Unlimited Audio Playback'],
    5
  ),
  (
    'master',
    'Master',
    129.00,
    'month',
    ARRAY['Everything in Scholar', '50+ Matric Past Papers', '9 Matric Study Guides', '10+ Matric 2026 Prep Papers'],
    6
  )
ON CONFLICT (key) DO UPDATE
  SET label            = EXCLUDED.label,
      price_rands      = EXCLUDED.price_rands,
      billing_interval = EXCLUDED.billing_interval,
      features         = EXCLUDED.features,
      sort_order       = EXCLUDED.sort_order,
      is_active        = true;

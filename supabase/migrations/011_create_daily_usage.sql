-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 011: Daily usage tracking for plan limits
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.daily_usage (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       date NOT NULL DEFAULT CURRENT_DATE,
  chat_count int  NOT NULL DEFAULT 0,
  hint_count int  NOT NULL DEFAULT 0,
  tts_count  int  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage; server uses service role for writes
CREATE POLICY "daily_usage_own_read" ON public.daily_usage
  FOR SELECT USING (auth.uid() = user_id);

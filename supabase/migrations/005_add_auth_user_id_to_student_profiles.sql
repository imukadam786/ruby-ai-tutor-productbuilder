-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005: Add auth_user_id to student_profiles
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- WHY: linkStudentProfileToAuth() and hydrateStudentProfileFromSupabase() both
-- depend on this column.  Without it both calls fail silently, so users on any
-- device without localStorage data are forced to redo the diagnostic on every
-- login.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add the column (safe to re-run — IF NOT EXISTS)
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Index for fast restore queries (hydrateStudentProfileFromSupabase)
CREATE INDEX IF NOT EXISTS student_profiles_auth_user_idx
  ON public.student_profiles (auth_user_id, subject)
  WHERE auth_user_id IS NOT NULL;

-- 3. RLS: let authenticated users read their own profiles for restore
--    (The existing open "student_profiles_select" policy already allows this,
--     but this more restrictive policy ensures the column is usable when the
--     open policy is tightened in the future.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'student_profiles' AND policyname = 'student_profiles_own_read'
  ) THEN
    EXECUTE 'CREATE POLICY "student_profiles_own_read" ON public.student_profiles
             FOR SELECT USING (auth_user_id = auth.uid())';
  END IF;
END$$;

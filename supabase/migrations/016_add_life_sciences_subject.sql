-- Migration 016: extend the `subject` check constraint on every table that
-- carries one, so 'life-sciences' is a valid value alongside the existing
-- subjects.
--
-- Follows migration 015's pattern (drop-and-re-add idempotent CHECK). The
-- replacement constraint includes ALL subject codes the app emits today
-- (per lib/analytics.ts Subject union) so this migration is safe to run
-- even if production has been manually extended past 015 for any of the
-- newer subjects (social-sciences, natural-sciences-tech,
-- matric-physical-sciences, maths-literacy).
--
-- Affected tables:
--   • student_profiles
--   • skill_attempts
--   • diagnostic_results
--   • student_reports        (written by LifeSciencesSession on session
--                             completion)

-- ── student_profiles ──────────────────────────────────────────────────────────
alter table public.student_profiles
  drop constraint if exists student_profiles_subject_check;
alter table public.student_profiles
  add constraint student_profiles_subject_check
  check (subject in (
    'maths', 'reading', 'life-skills', 'afrikaans-fal',
    'social-sciences', 'natural-sciences-tech',
    'matric-physical-sciences', 'maths-literacy',
    'life-sciences'
  ));

-- ── skill_attempts ────────────────────────────────────────────────────────────
alter table public.skill_attempts
  drop constraint if exists skill_attempts_subject_check;
alter table public.skill_attempts
  add constraint skill_attempts_subject_check
  check (subject in (
    'maths', 'reading', 'life-skills', 'afrikaans-fal',
    'social-sciences', 'natural-sciences-tech',
    'matric-physical-sciences', 'maths-literacy',
    'life-sciences'
  ));

-- ── diagnostic_results ────────────────────────────────────────────────────────
alter table public.diagnostic_results
  drop constraint if exists diagnostic_results_subject_check;
alter table public.diagnostic_results
  add constraint diagnostic_results_subject_check
  check (subject in (
    'maths', 'reading', 'life-skills', 'afrikaans-fal',
    'social-sciences', 'natural-sciences-tech',
    'matric-physical-sciences', 'maths-literacy',
    'life-sciences'
  ));

-- ── student_reports ───────────────────────────────────────────────────────────
alter table public.student_reports
  drop constraint if exists student_reports_subject_check;
alter table public.student_reports
  add constraint student_reports_subject_check
  check (subject in (
    'maths', 'reading', 'life-skills', 'afrikaans-fal',
    'social-sciences', 'natural-sciences-tech',
    'matric-physical-sciences', 'maths-literacy',
    'life-sciences'
  ));

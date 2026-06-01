-- Migration 019: extend the `subject` check constraint on every table that
-- carries one, so 'tourism' is a valid value alongside the existing subjects.
--
-- Follows migration 018's pattern (drop-and-re-add idempotent CHECK). The
-- replacement constraint includes ALL subject codes the app emits today.
-- Safe to re-run.
--
-- Affected tables:
--   • student_profiles
--   • skill_attempts
--   • diagnostic_results
--   • student_reports        (written by TourismSession on session completion)

-- ── student_profiles ──────────────────────────────────────────────────────────
alter table public.student_profiles
  drop constraint if exists student_profiles_subject_check;
alter table public.student_profiles
  add constraint student_profiles_subject_check
  check (subject in (
    'maths', 'reading', 'life-skills', 'afrikaans-fal',
    'social-sciences', 'natural-sciences-tech',
    'matric-physical-sciences', 'maths-literacy',
    'life-sciences', 'history', 'business-studies', 'tourism'
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
    'life-sciences', 'history', 'business-studies', 'tourism'
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
    'life-sciences', 'history', 'business-studies', 'tourism'
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
    'life-sciences', 'history', 'business-studies', 'tourism'
  ));

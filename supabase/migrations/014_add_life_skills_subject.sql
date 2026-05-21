-- Migration 014: extend the `subject` check constraint on every table that
-- carries one, so 'life-skills' is a valid value alongside 'maths' and 'reading'.
--
-- Affected tables:
--   • student_profiles      (subject of the serialized profile row)
--   • skill_attempts        (per-question analytics)
--   • diagnostic_results    (placement diagnostic per subject)
--   • student_reports       (parent-facing reports per subject)
--
-- Postgres auto-names inline CHECK constraints `<table>_<column>_check`.
-- We drop the existing one (if present) and add a replacement that accepts the
-- new value. Idempotent: safe to re-run.

-- ── student_profiles ──────────────────────────────────────────────────────────
alter table public.student_profiles
  drop constraint if exists student_profiles_subject_check;
alter table public.student_profiles
  add constraint student_profiles_subject_check
  check (subject in ('maths', 'reading', 'life-skills'));

-- ── skill_attempts ────────────────────────────────────────────────────────────
alter table public.skill_attempts
  drop constraint if exists skill_attempts_subject_check;
alter table public.skill_attempts
  add constraint skill_attempts_subject_check
  check (subject in ('maths', 'reading', 'life-skills'));

-- ── diagnostic_results ────────────────────────────────────────────────────────
alter table public.diagnostic_results
  drop constraint if exists diagnostic_results_subject_check;
alter table public.diagnostic_results
  add constraint diagnostic_results_subject_check
  check (subject in ('maths', 'reading', 'life-skills'));

-- ── student_reports ───────────────────────────────────────────────────────────
alter table public.student_reports
  drop constraint if exists student_reports_subject_check;
alter table public.student_reports
  add constraint student_reports_subject_check
  check (subject in ('maths', 'reading', 'life-skills'));

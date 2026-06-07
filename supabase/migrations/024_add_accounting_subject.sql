-- Migration 024: add 'accounting' (FET Accounting, Grades 10–12 — Financial
-- Accounting, Managerial Accounting and Managing Resources) to the subject
-- CHECK constraint on every table that carries one, so Accounting sessions can
-- persist. Also re-asserts every prior subject so this single statement brings
-- any DB fully up to date.
--
-- Note: 'accounting' (this FET Gr 10–12 subject) is distinct from
-- 'business-studies' and 'ems-sp', which are separate commerce subjects.
--
-- Drop-and-re-add idempotent CHECK, same pattern as 019–023. Safe to re-run.
--
-- Affected tables:
--   • student_profiles
--   • skill_attempts
--   • diagnostic_results
--   • student_reports

do $$
declare
  tbl text;
  allowed text := $list$
    'maths', 'reading', 'life-skills', 'afrikaans-fal',
    'social-sciences', 'natural-sciences-tech',
    'matric-physical-sciences', 'maths-literacy',
    'life-sciences', 'history', 'business-studies',
    'tourism', 'geography', 'natural-sciences-sp',
    'social-sciences-sp', 'ems-sp', 'accounting'
  $list$;
begin
  foreach tbl in array array[
    'student_profiles', 'skill_attempts',
    'diagnostic_results', 'student_reports'
  ]
  loop
    execute format(
      'alter table public.%I drop constraint if exists %I_subject_check',
      tbl, tbl
    );
    execute format(
      'alter table public.%I add constraint %I_subject_check check (subject in (%s))',
      tbl, tbl, allowed
    );
  end loop;
end $$;

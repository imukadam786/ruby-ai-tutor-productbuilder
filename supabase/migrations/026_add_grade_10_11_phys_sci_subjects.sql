-- Migration 026: add 'grade-10-physical-sciences' and 'grade-11-physical-sciences'
-- (FET Physical Sciences for Grades 10 and 11 — tap-native banks across P1
-- Physics and P2 Chemistry) to the subject CHECK constraint on every table that
-- carries one, so Grade 10/11 Physical Sciences sessions can persist.
--
-- These are distinct from 'matric-physical-sciences' (the Grade 12 NSC subject),
-- which is unchanged. Each grade keeps its own progress under its own subject
-- string.
--
-- Re-asserts every prior subject so this single statement brings any DB fully up
-- to date. Drop-and-re-add idempotent CHECK, same pattern as 019–024. Safe to
-- re-run.
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
    'social-sciences-sp', 'ems-sp', 'accounting',
    'grade-10-physical-sciences', 'grade-11-physical-sciences'
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

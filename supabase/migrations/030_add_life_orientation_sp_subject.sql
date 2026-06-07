-- Migration 030: add 'life-orientation-sp' (Life Orientation, Senior Phase,
-- Grades 7–9) to the subject CHECK constraint on every table that carries one,
-- so Life Orientation SP sessions can persist. Physical Education is excluded
-- from the build (movement-based), so this subject covers the four desk topics:
-- Development of the self in society; Health, social & environmental
-- responsibility; Constitutional rights & responsibilities; World of work.
--
-- Drop-and-re-add idempotent CHECK, same pattern as 019–029. Safe to re-run.
-- This list is the full superset of every prior subject plus the new one.
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
    'economics', 'grade-10-physical-sciences',
    'grade-11-physical-sciences', 'technology-sp',
    'life-orientation-sp'
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

-- Migration 021: add 'natural-sciences-sp' (Natural Sciences Senior Phase,
-- Grades 7–9) to the subject CHECK constraint on every table that carries one,
-- so Natural Sciences SP sessions can persist. Also re-asserts every prior
-- subject so this single statement brings any DB fully up to date.
--
-- Drop-and-re-add idempotent CHECK, same pattern as 018/019/020. Safe to re-run.
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
    'tourism', 'geography', 'natural-sciences-sp'
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

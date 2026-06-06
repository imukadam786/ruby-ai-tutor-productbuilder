-- Migration 029: add 'technology-sp' (Technology, Senior Phase, Grades 7–9 —
-- Structures + Mechanical Systems + Electrical Systems + Processing, plus the
-- Design Process & graphics) to the subject CHECK constraint on every table that
-- carries one, so Technology SP sessions can persist. Also re-asserts every
-- prior subject so this single statement brings any DB fully up to date.
--
-- Note: this is the Senior-Phase Technology subject. It is distinct from the
-- IP subject 'natural-sciences-tech' (Grades 4–6, where Technology is still
-- combined with Natural Sciences) — exactly as 'natural-sciences-sp' is a
-- separate Senior-Phase subject.
--
-- Drop-and-re-add idempotent CHECK, same pattern as 019–028. Safe to re-run.
-- This list is the full superset: it also restores 'grade-10-physical-sciences'
-- and 'grade-11-physical-sciences', which migration 028 inadvertently omitted
-- from its re-asserted CHECK.
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
    'grade-11-physical-sciences', 'technology-sp'
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

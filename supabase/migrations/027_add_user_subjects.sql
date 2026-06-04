-- Migration 027: Add subjects to users table
--
-- Stores the FET (Grade 10–12) subject selection a learner makes during
-- onboarding. Grades 1–9 leave this null — their subjects are compulsory and the
-- Subjects hub shows every grade-entitled subject. For Grades 10–12 the hub
-- filters down to this list.
--
-- Values are the canonical picker keys defined in lib/fet-subjects.ts
-- (e.g. {'english','mathematics','life-sciences'}). English is always included.
-- A null or empty array means "show all" — fail-open for any account created
-- before this feature shipped, matching the hub's existing grade fail-open.

alter table public.users
  add column if not exists subjects text[];

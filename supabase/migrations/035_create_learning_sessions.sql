-- Migration 035: learning_sessions — one row per practice session, across
-- every subject. Durable replacement for the session-length numbers that
-- previously only went to PostHog (trackSessionStarted/trackSessionEnded)
-- and were never queryable from the app's own database.

create table if not exists public.learning_sessions (
  id                 bigserial primary key,
  student_id         text not null,
  subject            text not null,
  skill_id           text,
  started_at         timestamptz not null,
  ended_at           timestamptz not null,
  duration_ms        int not null,
  questions_answered int not null,
  correct            int not null,
  created_at         timestamptz default now()
);

create index if not exists learning_sessions_student_idx
  on public.learning_sessions (student_id, subject, started_at desc);

alter table public.learning_sessions enable row level security;

create policy "learning_sessions_insert" on public.learning_sessions
  for insert with check (true);

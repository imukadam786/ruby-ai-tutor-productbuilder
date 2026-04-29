-- Migration 008: Add missing tables + extend progress/users
-- All user data previously in localStorage now persisted in Supabase.

-- ── Extend existing tables ────────────────────────────────────────────────────

alter table public.users
  add column if not exists average_score text;

alter table public.progress
  add column if not exists lessons_started    int default 0,
  add column if not exists subject_breakdown  jsonb default '{}';

-- ── user_streaks ──────────────────────────────────────────────────────────────

create table if not exists public.user_streaks (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  current_streak   int default 0,
  best_streak      int default 0,
  last_active_date date,
  daily_activity   jsonb default '{}',
  updated_at       timestamptz default now()
);

alter table public.user_streaks enable row level security;

create policy "streaks_own" on public.user_streaks
  for all using (auth.uid() = user_id);

-- ── chat_messages ─────────────────────────────────────────────────────────────

create table if not exists public.chat_messages (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now()
);

create index if not exists chat_messages_user_idx
  on public.chat_messages (user_id, created_at);

alter table public.chat_messages enable row level security;

create policy "messages_own" on public.chat_messages
  for all using (auth.uid() = user_id);

-- ── student_reports ───────────────────────────────────────────────────────────

create table if not exists public.student_reports (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  subject      text not null check (subject in ('maths', 'reading')),
  input_data   jsonb not null,
  content_data jsonb not null,
  generated_at timestamptz not null,
  created_at   timestamptz default now()
);

create index if not exists student_reports_user_subject_idx
  on public.student_reports (user_id, subject, generated_at desc);

alter table public.student_reports enable row level security;

create policy "reports_own" on public.student_reports
  for all using (auth.uid() = user_id);

-- ── matric_paper_progress ─────────────────────────────────────────────────────

create table if not exists public.matric_paper_progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  paper_id   text not null,
  status     text not null check (status in ('not_started', 'in_progress', 'completed')),
  pct        int,
  updated_at timestamptz default now(),
  primary key (user_id, paper_id)
);

alter table public.matric_paper_progress enable row level security;

create policy "matric_progress_own" on public.matric_paper_progress
  for all using (auth.uid() = user_id);

-- ── matric_waitlist ───────────────────────────────────────────────────────────

create table if not exists public.matric_waitlist (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete set null,
  email      text,
  created_at timestamptz default now()
);

alter table public.matric_waitlist enable row level security;

create policy "waitlist_insert" on public.matric_waitlist
  for insert with check (true);

create policy "waitlist_own_read" on public.matric_waitlist
  for select using (user_id = auth.uid() or user_id is null);

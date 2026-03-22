-- ─────────────────────────────────────────────────────────────
-- Ruby AI Tutor — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- 1. USERS (extends Supabase auth.users)
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  grade        text,
  curriculum   text,
  language     text default 'en',
  plan         text default 'free' check (plan in ('free', 'pro', 'school')),
  created_at   timestamptz default now()
);

-- 2. FEEDBACK (from beta banner "Share feedback")
create table if not exists public.feedback (
  id           bigserial primary key,
  user_id      uuid references public.users(id) on delete set null,
  category     text not null,
  text         text not null,
  url          text,
  created_at   timestamptz default now()
);

-- 3. SESSION SURVEYS (post-session emoji ratings)
create table if not exists public.session_surveys (
  id           bigserial primary key,
  user_id      uuid references public.users(id) on delete set null,
  session_type text not null check (session_type in ('maths', 'reading', 'chat')),
  rating       int not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz default now()
);

-- 4. PROGRESS (synced from localStorage)
create table if not exists public.progress (
  id                bigserial primary key,
  user_id           uuid unique references public.users(id) on delete cascade,
  total_messages    int default 0,
  lessons_completed int default 0,
  topics_studied    text[] default '{}',
  session_count     int default 0,
  last_session      timestamptz default now(),
  updated_at        timestamptz default now()
);

-- 5. SUBSCRIPTIONS (set by Stripe/PayFast webhook later)
create table if not exists public.subscriptions (
  id                bigserial primary key,
  user_id           uuid unique references public.users(id) on delete cascade,
  plan              text default 'free' check (plan in ('free', 'pro', 'school')),
  status            text default 'active' check (status in ('active', 'cancelled', 'past_due')),
  stripe_customer_id text,
  current_period_end timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── Row Level Security (RLS) — users can only see their own data ──────────────
alter table public.users           enable row level security;
alter table public.feedback        enable row level security;
alter table public.session_surveys enable row level security;
alter table public.progress        enable row level security;
alter table public.subscriptions   enable row level security;

-- Users: read/update own row
create policy "users_own" on public.users
  for all using (auth.uid() = id);

-- Feedback: insert anonymously or as logged-in user, read own
create policy "feedback_insert" on public.feedback
  for insert with check (true);
create policy "feedback_own_read" on public.feedback
  for select using (user_id = auth.uid() or user_id is null);

-- Surveys: same as feedback
create policy "surveys_insert" on public.session_surveys
  for insert with check (true);
create policy "surveys_own_read" on public.session_surveys
  for select using (user_id = auth.uid() or user_id is null);

-- Progress: own row only
create policy "progress_own" on public.progress
  for all using (auth.uid() = user_id);

-- Subscriptions: own row only
create policy "subscriptions_own" on public.subscriptions
  for all using (auth.uid() = user_id);

-- ── Auto-create user profile on sign up ──────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Phase 2 — Student progress persistence
-- ─────────────────────────────────────────────────────────────

-- 6. STUDENT PROFILES
-- Full serialized maths or reading student profile, upserted on every save.
-- id is localStorage-generated ("student_…" for maths, "reading_…" for reading).
-- No auth dependency — Phase 3 will link to auth.uid() when login is added.
create table if not exists public.student_profiles (
  id           text primary key,
  subject      text not null check (subject in ('maths', 'reading')),
  name         text not null,
  grade        int  not null,
  profile_data jsonb not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 7. SKILL ATTEMPTS
-- One row per question attempt. Used for analytics and future reporting.
create table if not exists public.skill_attempts (
  id           bigserial primary key,
  student_id   text not null,
  subject      text not null check (subject in ('maths', 'reading')),
  skill_id     text not null,
  is_correct   boolean not null,
  error_type   text,
  template     text,
  scaffolded   boolean default false,
  p_learned    float,
  created_at   timestamptz default now()
);

-- 8. DIAGNOSTIC RESULTS
-- One row per completed placement diagnostic.
create table if not exists public.diagnostic_results (
  id                       bigserial primary key,
  student_id               text not null,
  subject                  text not null check (subject in ('maths', 'reading')),
  entry_skill_id           text not null,
  entry_level              int,
  auto_completed_skill_ids text[] default '{}',
  dominant_errors          text[] default '{}',
  hard_gate_passed         boolean default true,
  completed_at             timestamptz not null,
  created_at               timestamptz default now()
);

-- ── RLS — allow anon inserts (no auth in Phase 2) ────────────────────────────
alter table public.student_profiles  enable row level security;
alter table public.skill_attempts    enable row level security;
alter table public.diagnostic_results enable row level security;

create policy "student_profiles_insert" on public.student_profiles
  for insert with check (true);
create policy "student_profiles_update" on public.student_profiles
  for update using (true);
create policy "student_profiles_select" on public.student_profiles
  for select using (true);

create policy "skill_attempts_insert" on public.skill_attempts
  for insert with check (true);

create policy "diagnostic_results_insert" on public.diagnostic_results
  for insert with check (true);

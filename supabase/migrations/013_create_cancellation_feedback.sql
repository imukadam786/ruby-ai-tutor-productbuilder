-- Migration 013: Capture why users cancel their subscription.
-- Written client-side from the cancellation flow (SettingsView) immediately
-- before the PayFast cancel call. Plan / tenure / billing date are NOT
-- duplicated here — join to public.subscriptions / public.payments on user_id.

create table if not exists public.cancellation_feedback (
  id                   bigserial primary key,
  user_id              uuid not null references auth.users(id) on delete cascade,
  -- Every reason the user ticked (multi-select).
  reasons              text[] not null,
  -- The single biggest reason (when more than one was ticked).
  primary_reason       text,
  -- Reworded "save offer" demand signals — these features don't exist yet,
  -- so we measure interest only.
  cheaper_plan_would_keep boolean,
  pause_would_keep        boolean,
  -- Conditional follow-up answer (which subject let them down, where the
  -- technical problem was, etc). Single value, depends on primary_reason.
  detail               text,
  -- Free-text: required-ish for "other", optional for everyone else.
  comment              text,
  -- 'cancelled' = they went through with it; 'kept' = backed out at confirm.
  outcome              text not null default 'cancelled'
                         check (outcome in ('cancelled', 'kept')),
  created_at           timestamptz default now()
);

create index if not exists cancellation_feedback_user_idx
  on public.cancellation_feedback (user_id, created_at desc);

alter table public.cancellation_feedback enable row level security;

-- A signed-in user may only insert a row for themselves.
create policy "cancellation_feedback_insert_own" on public.cancellation_feedback
  for insert with check (auth.uid() = user_id);

-- And only read their own rows (analytics runs via the service role).
create policy "cancellation_feedback_read_own" on public.cancellation_feedback
  for select using (auth.uid() = user_id);

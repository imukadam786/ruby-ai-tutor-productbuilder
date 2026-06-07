-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 025: Rubies rewards — Phase 1 (earning only)
--
-- Adds the ruby currency foundation: a cached per-user balance + combo/milestone
-- state (ruby_state) and an append-only ledger of every ruby earned (ruby_ledger).
-- The ledger is the source of truth for balances AND the only earn-analytics
-- record (no third-party analytics), so a few balancing views ship with it.
--
-- All awarding goes through the SECURITY DEFINER functions below, called from the
-- server with the service-role client. Clients may only READ their own rows.
-- Phase 1 = earning + display only. No spending.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── ruby_state: one row per user (cached balance + live combo/milestone state) ──
create table if not exists public.ruby_state (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  balance            int  not null default 0,
  current_combo      int  not null default 0,   -- consecutive correct answers; resets on a wrong one
  combo_updated_date date,                       -- the day current_combo / milestones_today belong to
  milestones_today   jsonb not null default '{}',-- {"5":true,...} streak milestones already paid today
  updated_at         timestamptz not null default now()
);

-- ── ruby_ledger: append-only, one row per ruby award ────────────────────────────
create table if not exists public.ruby_ledger (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  amount          int  not null,
  reason          text not null check (
                    reason in ('correct_answer','daily_login','skill_mastered','effort_floor')
                    or reason like 'streak_%'
                  ),
  idempotency_key text not null unique,          -- collapses double-submits / retries
  subject         text,
  skill_id        text,
  created_at      timestamptz not null default now()
);

create index if not exists ruby_ledger_user_day_idx
  on public.ruby_ledger (user_id, created_at);
create index if not exists ruby_ledger_reason_idx
  on public.ruby_ledger (reason, created_at);

-- ── RLS — learners read their own balance/history; all writes go via the
--          service-role client (the SECURITY DEFINER functions below) ────────────
alter table public.ruby_state  enable row level security;
alter table public.ruby_ledger enable row level security;

create policy "ruby_state_own_read" on public.ruby_state
  for select using (auth.uid() = user_id);

create policy "ruby_ledger_own_read" on public.ruby_ledger
  for select using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Awarding functions
-- Reward NUMBERS are passed in as parameters (single source of truth lives in
-- lib/rewards.ts → RUBY_RULES). These functions only do the atomic state change,
-- so re-balancing never means editing SQL.
-- ─────────────────────────────────────────────────────────────────────────────

-- award_correct: a correct answer. Advances the combo, pays the combo-tier reward,
-- and pays a streak milestone bonus the first time per day the combo hits a
-- threshold. Idempotent on p_idempotency_key — a duplicate submit changes nothing
-- (combo included). p_combo_tiers is indexed by the new combo length, capped at
-- the array length (e.g. {1,1,2,2,3} → 1st/2nd correct = 1, 3rd/4th = 2, 5th+ = 3).
create or replace function public.award_correct(
  p_user_id              uuid,
  p_idempotency_key      text,
  p_combo_tiers          int[],
  p_milestone_thresholds int[],
  p_milestone_bonuses    int[],
  p_subject              text,
  p_skill_id             text,
  p_today                date
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_combo      int;
  v_combo_date date;
  v_milestones jsonb;
  v_new_combo  int;
  v_base       int;
  v_bonus      int := 0;
  v_i          int;
  v_threshold  int;
  v_mkey       text;
  v_balance    int;
begin
  insert into public.ruby_state(user_id) values (p_user_id)
    on conflict (user_id) do nothing;

  -- Lock this user's state row so concurrent / duplicate submits serialise.
  select current_combo, combo_updated_date, milestones_today
    into v_combo, v_combo_date, v_milestones
    from public.ruby_state
   where user_id = p_user_id
     for update;

  -- Idempotency: already awarded for this exact answer → no change at all.
  if exists (select 1 from public.ruby_ledger where idempotency_key = p_idempotency_key) then
    return json_build_object(
      'awarded', 0,
      'new_balance', (select balance from public.ruby_state where user_id = p_user_id),
      'combo', v_combo,
      'milestone_bonus', 0,
      'duplicate', true
    );
  end if;

  -- New day → combo streak milestones reset.
  if v_combo_date is distinct from p_today then
    v_milestones := '{}'::jsonb;
  end if;

  v_new_combo := coalesce(v_combo, 0) + 1;

  -- Base reward = combo tier, capped at the array length.
  v_i := least(v_new_combo, array_length(p_combo_tiers, 1));
  v_base := p_combo_tiers[v_i];

  insert into public.ruby_ledger(user_id, amount, reason, idempotency_key, subject, skill_id)
    values (p_user_id, v_base, 'correct_answer', p_idempotency_key, p_subject, p_skill_id);

  -- Streak milestone bonus — once per threshold per day.
  for v_i in 1 .. coalesce(array_length(p_milestone_thresholds, 1), 0) loop
    v_threshold := p_milestone_thresholds[v_i];
    if v_new_combo = v_threshold and not (v_milestones ? v_threshold::text) then
      v_bonus := p_milestone_bonuses[v_i];
      v_mkey := p_user_id::text || ':streak_' || v_threshold::text || ':' || p_today::text;
      insert into public.ruby_ledger(user_id, amount, reason, idempotency_key, subject, skill_id)
        values (p_user_id, v_bonus, 'streak_' || v_threshold::text, v_mkey, p_subject, p_skill_id)
        on conflict (idempotency_key) do nothing;
      v_milestones := v_milestones || jsonb_build_object(v_threshold::text, true);
    end if;
  end loop;

  update public.ruby_state
     set balance            = balance + v_base + v_bonus,
         current_combo      = v_new_combo,
         combo_updated_date = p_today,
         milestones_today   = v_milestones,
         updated_at         = now()
   where user_id = p_user_id
   returning balance into v_balance;

  return json_build_object(
    'awarded', v_base + v_bonus,
    'new_balance', v_balance,
    'combo', v_new_combo,
    'milestone_bonus', v_bonus,
    'duplicate', false
  );
end;
$$;

-- reset_combo: a wrong answer breaks the streak. Safe no-op if no state row yet.
create or replace function public.reset_combo(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ruby_state
     set current_combo = 0, updated_at = now()
   where user_id = p_user_id;
end;
$$;

-- award_flat: a fixed reward (daily login, first-time skill mastery, effort floor).
-- Idempotent on p_idempotency_key, so "once per day" / "once ever" is enforced by
-- how the caller builds the key.
create or replace function public.award_flat(
  p_user_id         uuid,
  p_amount          int,
  p_reason          text,
  p_idempotency_key text,
  p_subject         text,
  p_skill_id        text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted int;
  v_balance  int;
begin
  insert into public.ruby_state(user_id) values (p_user_id)
    on conflict (user_id) do nothing;

  insert into public.ruby_ledger(user_id, amount, reason, idempotency_key, subject, skill_id)
    values (p_user_id, p_amount, p_reason, p_idempotency_key, p_subject, p_skill_id)
    on conflict (idempotency_key) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    return json_build_object(
      'awarded', 0,
      'new_balance', (select balance from public.ruby_state where user_id = p_user_id),
      'duplicate', true
    );
  end if;

  update public.ruby_state
     set balance = balance + p_amount, updated_at = now()
   where user_id = p_user_id
   returning balance into v_balance;

  return json_build_object('awarded', p_amount, 'new_balance', v_balance, 'duplicate', false);
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Balancing views (the only earn-analytics window — no PostHog).
-- Query with the service-role client / SQL editor. Not exposed to learners.
-- ─────────────────────────────────────────────────────────────────────────────

-- Rubies earned per learner per day — spot outliers / farmers.
create or replace view public.ruby_earn_by_user_day as
  select user_id,
         created_at::date as day,
         sum(amount)      as rubies,
         count(*)         as awards
    from public.ruby_ledger
   group by user_id, created_at::date;

-- Where rubies come from — is one faucet paying out everything?
create or replace view public.ruby_earn_by_reason as
  select reason,
         created_at::date as day,
         sum(amount)      as rubies,
         count(*)         as awards
    from public.ruby_ledger
   group by reason, created_at::date;

-- Average rubies earned per learner, by school grade.
create or replace view public.ruby_avg_per_user_by_grade as
  select u.grade,
         count(distinct l.user_id)                                              as learners,
         sum(l.amount)                                                          as total_rubies,
         round(sum(l.amount)::numeric / nullif(count(distinct l.user_id), 0), 1) as avg_per_learner
    from public.ruby_ledger l
    join public.users u on u.id = l.user_id
   group by u.grade;

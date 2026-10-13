-- Migration 036: learner_teachability — "improves after an explanation" for
-- the teacher dashboard. Ruby explains every wrong answer, so for each wrong
-- answer we look at the learner's NEXT answer on the same skill and count how
-- often it is right. Built only from skill_attempts, which every subject now
-- writes to (Maths and Reading always have; the other 18 since 2026-10-13).
--
-- security_invoker + revoke: skill_attempts is insert-only for the app, so the
-- view must not become a way for app users to read other learners' answers.

create or replace view public.learner_teachability
with (security_invoker = true) as
with ordered as (
  select
    student_id,
    subject,
    is_correct,
    lead(is_correct) over (
      partition by student_id, subject, skill_id
      order by created_at, id
    ) as next_correct
  from public.skill_attempts
)
select
  student_id,
  subject,
  count(*) filter (where not is_correct and next_correct is not null) as wrong_answers_followed_up,
  count(*) filter (where not is_correct and next_correct)             as right_next_time,
  round(
    100.0 * count(*) filter (where not is_correct and next_correct)
    / nullif(count(*) filter (where not is_correct and next_correct is not null), 0)
  ) as teachability_pct
from ordered
group by student_id, subject;

revoke all on public.learner_teachability from anon, authenticated;

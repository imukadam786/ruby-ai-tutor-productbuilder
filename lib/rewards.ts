/**
 * Rubies rewards — Phase 1 (earning only).
 *
 * Single source of truth for reward NUMBERS (RUBY_RULES) plus the only code that
 * writes rubies. Every faucet — every subject's submit-answer route, daily login,
 * skill mastery, the effort floor — goes through the helpers here, which call the
 * atomic SECURITY DEFINER functions from migration 025 via the service-role client.
 *
 * Re-balancing the economy = editing RUBY_RULES below. Nothing else changes.
 * No spending in Phase 1.
 */
import { supabaseAdmin } from "@/lib/supabase-admin";

export const RUBY_RULES = {
  // Correct-answer combo. Indexed by the new combo length, capped at the array
  // end: 1st/2nd correct in a row = 1, 3rd/4th = 2, 5th onward = 3. Resets on a
  // wrong answer. One global counter per user (not per subject).
  comboTiers: [1, 1, 2, 2, 3],

  // Streak milestones (thresholds and bonuses align by index). Paid once per
  // threshold per day — the combo has to climb back up to earn them again.
  milestoneThresholds: [5, 8, 10],
  milestoneBonuses: [5, 10, 20],

  // Flat rewards.
  dailyLogin: { base: 2, perDayStreak: 1, cap: 5 }, // base + (streak-1)*perDay, capped
  skillMasteredFirstTime: 10,                        // first time a skill is mastered, ever
  effortFloor: 2,                                    // finished a lesson even with wrong answers
} as const;

export type RubyAward = {
  awarded: number;
  new_balance: number;
  combo?: number;
  milestone_bonus?: number;
  duplicate: boolean;
};

/** UTC date stamp (YYYY-MM-DD) used for daily idempotency keys / combo resets. */
function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Low-level RPC wrappers ─────────────────────────────────────────────────────

async function awardCorrect(
  userId: string,
  idempotencyKey: string,
  subject: string,
  skillId?: string,
): Promise<RubyAward | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc("award_correct", {
      p_user_id: userId,
      p_idempotency_key: idempotencyKey,
      p_combo_tiers: RUBY_RULES.comboTiers,
      p_milestone_thresholds: RUBY_RULES.milestoneThresholds,
      p_milestone_bonuses: RUBY_RULES.milestoneBonuses,
      p_subject: subject,
      p_skill_id: skillId ?? null,
      p_today: today(),
    });
    if (error) {
      console.error("awardCorrect error:", error.message);
      return null;
    }
    return data as RubyAward;
  } catch (e) {
    console.error("awardCorrect threw:", e);
    return null;
  }
}

async function resetCombo(userId: string): Promise<void> {
  try {
    await supabaseAdmin.rpc("reset_combo", { p_user_id: userId });
  } catch (e) {
    console.error("resetCombo threw:", e);
  }
}

export async function awardFlat(opts: {
  userId: string;
  amount: number;
  reason: "daily_login" | "skill_mastered" | "effort_floor";
  idempotencyKey: string;
  subject?: string;
  skillId?: string;
}): Promise<RubyAward | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc("award_flat", {
      p_user_id: opts.userId,
      p_amount: opts.amount,
      p_reason: opts.reason,
      p_idempotency_key: opts.idempotencyKey,
      p_subject: opts.subject ?? null,
      p_skill_id: opts.skillId ?? null,
    });
    if (error) {
      console.error("awardFlat error:", error.message);
      return null;
    }
    return data as RubyAward;
  } catch (e) {
    console.error("awardFlat threw:", e);
    return null;
  }
}

// ─── Faucets (what routes / endpoints call) ─────────────────────────────────────

/**
 * The one call every subject submit-answer route makes after grading. Correct →
 * advances the combo and pays out; wrong → resets the combo and pays nothing.
 *
 * The idempotency key is derived from fields the routes already receive, so a
 * double-click / retry collapses to a single award (combo included) with NO
 * client change. question_id falls back to skill_id for routes that omit it; the
 * day stamp lets the same banked question legitimately earn again on another day.
 */
export async function rewardAnswer(opts: {
  userId: string;
  isCorrect: boolean;
  subject: string;
  questionId?: string;
  skillId?: string;
  attemptNumber?: number;
}): Promise<RubyAward | null> {
  if (!opts.isCorrect) {
    await resetCombo(opts.userId);
    return null;
  }
  const key = [
    opts.userId,
    opts.subject,
    "ans",
    opts.questionId ?? opts.skillId ?? "q",
    opts.attemptNumber ?? 1,
    today(),
  ].join(":");
  return awardCorrect(opts.userId, key, opts.subject, opts.skillId);
}

/**
 * Daily-login reward. Maintains the day-streak in user_streaks (increment if
 * yesterday, reset if a gap, no-op if already counted today) and pays
 * base + (streak-1)*perDay capped. Idempotent per day via the streak date.
 */
export async function awardDailyLogin(userId: string): Promise<RubyAward | null> {
  const day = today();
  const { data: streak } = await supabaseAdmin
    .from("user_streaks")
    .select("current_streak, best_streak, last_active_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (streak?.last_active_date === day) {
    // Already counted today — return current balance, award nothing.
    const { data: state } = await supabaseAdmin
      .from("ruby_state")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();
    return { awarded: 0, new_balance: (state?.balance as number) ?? 0, duplicate: true };
  }

  // Yesterday → continue the streak; any older / missing → restart at 1.
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
  const continued = streak?.last_active_date === yesterday;
  const newStreak = continued ? ((streak?.current_streak as number) ?? 0) + 1 : 1;
  const bestStreak = Math.max((streak?.best_streak as number) ?? 0, newStreak);

  await supabaseAdmin.from("user_streaks").upsert(
    {
      user_id: userId,
      current_streak: newStreak,
      best_streak: bestStreak,
      last_active_date: day,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  const { base, perDayStreak, cap } = RUBY_RULES.dailyLogin;
  const amount = Math.min(base + (newStreak - 1) * perDayStreak, cap);

  return awardFlat({
    userId,
    amount,
    reason: "daily_login",
    idempotencyKey: `${userId}:daily_login:${day}`,
  });
}

/** First-time-ever skill mastery bonus. Idempotency key makes it once-per-skill. */
export async function awardSkillMastered(
  userId: string,
  subject: string,
  skillId: string,
): Promise<RubyAward | null> {
  return awardFlat({
    userId,
    amount: RUBY_RULES.skillMasteredFirstTime,
    reason: "skill_mastered",
    idempotencyKey: `${userId}:skill_mastered:${subject}:${skillId}`,
    subject,
    skillId,
  });
}

/** Effort floor — finished a lesson even with wrong answers. Once per lesson per day. */
export async function awardEffortFloor(
  userId: string,
  subject: string,
  lessonId: string,
): Promise<RubyAward | null> {
  return awardFlat({
    userId,
    amount: RUBY_RULES.effortFloor,
    reason: "effort_floor",
    idempotencyKey: `${userId}:effort_floor:${subject}:${lessonId}:${today()}`,
    subject,
  });
}

/** Read a user's current ruby balance (for the balance endpoint). */
export async function getBalance(userId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from("ruby_state")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.balance as number) ?? 0;
}

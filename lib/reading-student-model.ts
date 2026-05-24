import {
  ReadingStudentProfile,
  ReadingSkillMastery,
  ReadingSkillAttempt,
  ReadingErrorType,
  ReadingAtomicSkill,
  ReadingMasteryStatus,
  ReadingTemplate,
  DiagnosticPlacementResult,
} from "@/types/reading";
import readingSkillTreeData from "@/data/reading-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import {
  initBKT,
  updateBKT,
  isMastered as bktIsMastered,
  DEFAULT_BKT_PARAMS,
  transitForReadingLevel,
} from "@/lib/bkt";

const DEFAULT_STARTING_SKILL = "R1.T1.A1";
const DEFAULT_STARTING_LEVEL = 1;
const DEFAULT_STARTING_TIER = "R1.T1";

// ─── Load / Save ──────────────────────────────────────────────────────────────

export function getReadingProfile(): ReadingStudentProfile | null {
  return null;
}

export function saveReadingProfile(profile: ReadingStudentProfile): Promise<void> {
  // Returns a promise so callers that NEED the write to land (e.g. placement
  // completion) can await it. Most callers fire-and-forget; that still works.
  return (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      await retrySupabase(async () => {
        const { error } = await supabase.from("student_profiles").upsert({
          id: profile.id,
          subject: "reading",
          name: profile.name,
          grade: profile.grade,
          ...(user?.id ? { auth_user_id: user.id } : {}),
          profile_data: profile as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
        if (error) throw error;
      });
    } catch (err) {
      // Surface failures — silent drops were masking placement-not-saved bugs.
      console.error("[saveReadingProfile] upsert failed:", err);
    }
  })();
}

/**
 * Links this profile to the currently authenticated Supabase user.
 * Called fire-and-forget on init — enables hydrateReadingProfileFromSupabase() to work.
 * No-op if not authenticated.
 */
export async function linkReadingProfileToAuth(profileId: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    void retrySupabase(() =>
      supabase.from("student_profiles")
        .update({ auth_user_id: user.id })
        .eq("id", profileId)
    );
  } catch { /* non-critical */ }
}

/**
 * When localStorage is empty (e.g. browser data cleared), queries Supabase
 * for the most recent reading profile linked to the authenticated user,
 * restores it to localStorage, and returns it.
 * Returns null if not authenticated or no profile found.
 */
export async function hydrateReadingProfileFromSupabase(): Promise<ReadingStudentProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;
    const { data } = await supabase
      .from("student_profiles")
      .select("profile_data")
      .eq("auth_user_id", user.id)
      .eq("subject", "reading")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data?.profile_data) return null;
    return data.profile_data as unknown as ReadingStudentProfile;
  } catch {
    return null;
  }
}

export function createReadingProfile(name: string, grade: number): ReadingStudentProfile {
  const profile: ReadingStudentProfile = {
    id: crypto.randomUUID(),
    name,
    grade,
    current_level: DEFAULT_STARTING_LEVEL,
    current_tier_id: DEFAULT_STARTING_TIER,
    current_skill_id: DEFAULT_STARTING_SKILL,
    skill_mastery: {},
    session_count: 1,
    total_attempts: 0,
    total_correct: 0,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    error_history: {
      ERR_PHONEME_CONF: 0,
      ERR_SYLLABLE_BREAK: 0,
      ERR_SOUND_RECALL: 0,
      ERR_BLEND_FAIL: 0,
      ERR_ENCODE_BLEND: 0,
      ERR_SOUND_OMIT: 0,
      ERR_SOUND_INSERT: 0,
      ERR_VOWEL_CONF: 0,
      ERR_ORTHO_GUESS: 0,
      ERR_SIGHT_MISS: 0,
      ERR_MULTI_BREAK: 0,
      ERR_FLUENCY_HES: 0,
      ERR_MEANING_BLIND: 0,
      ERR_SELF_MON: 0,
      correct: 0,
    },
    placementCompleted: false,
    placement: null,
    errorPatterns: {},
    sessionHistory: {},
    used_questions: {},
  };
  saveReadingProfile(profile);
  return profile;
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export function recordReadingAttempt(
  profile: ReadingStudentProfile,
  attempt: ReadingSkillAttempt,
  updatedMastery: ReadingSkillMastery
): ReadingStudentProfile {
  const errorKey = attempt.error_type as ReadingErrorType;
  const existing = profile.errorPatterns[attempt.skill_id];
  const updated: ReadingStudentProfile = {
    ...profile,
    total_attempts: profile.total_attempts + 1,
    total_correct: attempt.is_correct ? profile.total_correct + 1 : profile.total_correct,
    last_active: new Date().toISOString(),
    skill_mastery: {
      ...profile.skill_mastery,
      [attempt.skill_id]: updatedMastery,
    },
    error_history: {
      ...profile.error_history,
      [errorKey]: (profile.error_history[errorKey] || 0) + 1,
    },
    errorPatterns: attempt.is_correct ? profile.errorPatterns : {
      ...profile.errorPatterns,
      [attempt.skill_id]: {
        type: errorKey,
        count: (existing?.count ?? 0) + 1,
        retaughtCount: !attempt.is_correct
          ? (existing?.retaughtCount ?? 0) + 1
          : (existing?.retaughtCount ?? 0),
      },
    },
  };
  saveReadingProfile(updated);
  // Supabase sync with retry
  void retrySupabase(() => supabase.from("skill_attempts").insert({
    student_id: profile.id,
    subject: "reading",
    skill_id: attempt.skill_id,
    is_correct: attempt.is_correct,
    error_type: attempt.error_type ?? null,
    template: attempt.template ?? null,
    scaffolded: attempt.scaffolded ?? false,
    p_learned: updatedMastery.p_learned ?? null,
  }));
  return updated;
}

export function advanceToReadingSkill(
  profile: ReadingStudentProfile,
  skillId: string
): ReadingStudentProfile {
  const parts = skillId.split(".");
  const levelId = parseInt(parts[0].replace("R", ""));
  const tierId = `${parts[0]}.${parts[1]}`;
  const updated: ReadingStudentProfile = {
    ...profile,
    current_skill_id: skillId,
    current_tier_id: tierId,
    current_level: levelId,
    last_active: new Date().toISOString(),
  };
  saveReadingProfile(updated);
  return updated;
}

// ─── Mastery ──────────────────────────────────────────────────────────────────

export function initReadingSkillMastery(skillId: string): ReadingSkillMastery {
  return {
    skill_id: skillId,
    status: "locked",
    correct_count: 0,
    attempt_count: 0,
    formats_used: [],
    scaffolded_attempts: 0,
    last_attempted: new Date().toISOString(),
    attempts: [],
    p_learned: initBKT(DEFAULT_BKT_PARAMS),
  };
}

// ─── Grade-adjusted mastery threshold ─────────────────────────────────────────
// Grade 1: −0.15 (0.95 → 0.80)   Grade 2: −0.05 (0.95 → 0.90)   Grade 3+: 0.95
// Floor at 0.50 to prevent trivial mastery.
function gradeAdjustedIsMastered(p_learned: number, grade: number): boolean {
  const base = 0.95;
  const adjustment = grade <= 1 ? -0.15 : grade === 2 ? -0.05 : 0;
  const threshold = Math.max(0.50, base + adjustment);
  return p_learned >= threshold;
}

const MASTERY_MIN_ATTEMPTS = 5;

export function evaluateReadingMastery(
  attempts: ReadingSkillAttempt[],
  p_learned: number,
  grade?: number
): ReadingMasteryStatus {
  if (attempts.length === 0) return "locked";
  if (attempts.length < MASTERY_MIN_ATTEMPTS) return "in_progress";
  const mastered = grade !== undefined
    ? gradeAdjustedIsMastered(p_learned, grade)
    : bktIsMastered(p_learned);
  return mastered ? "mastered" : "in_progress";
}

export function updateReadingSkillMastery(
  existing: ReadingSkillMastery,
  attempt: ReadingSkillAttempt,
  grade?: number
): ReadingSkillMastery {
  const updatedAttempts = [...existing.attempts, attempt];

  // ── BKT update ────────────────────────────────────────────────────────────
  // Level-banded p_transit: phonics skills are acquired faster than comprehension.
  const levelMatch = attempt.skill_id.match(/^R(\d+)/);
  const skillLevel = levelMatch ? parseInt(levelMatch[1], 10) : 3;
  const bktParams = { ...DEFAULT_BKT_PARAMS, p_transit: transitForReadingLevel(skillLevel) };
  const currentP = existing.p_learned ?? initBKT(DEFAULT_BKT_PARAMS);
  const updatedP = updateBKT(currentP, attempt.is_correct, bktParams);

  const newStatus = evaluateReadingMastery(updatedAttempts, updatedP, grade);
  const formatsUsed = Array.from(
    new Set([...existing.formats_used, attempt.template])
  ) as ReadingTemplate[];

  return {
    ...existing,
    attempts: updatedAttempts,
    attempt_count: existing.attempt_count + 1,
    correct_count: attempt.is_correct ? existing.correct_count + 1 : existing.correct_count,
    scaffolded_attempts: attempt.scaffolded ? existing.scaffolded_attempts + 1 : existing.scaffolded_attempts,
    formats_used: formatsUsed,
    last_attempted: attempt.timestamp,
    status: newStatus,
    p_learned: updatedP,
    mastered_at:
      newStatus === "mastered" && existing.status !== "mastered"
        ? new Date().toISOString()
        : existing.mastered_at,
  };
}

export function updateSessionHistory(
  profile: ReadingStudentProfile,
  skillId: string,
  passed: boolean
): ReadingStudentProfile {
  const existing = profile.sessionHistory[skillId] || [];
  const updated: ReadingStudentProfile = {
    ...profile,
    sessionHistory: {
      ...profile.sessionHistory,
      [skillId]: [...existing, passed],
    },
  };
  saveReadingProfile(updated);
  return updated;
}

// ─── Skill Tree Helpers ───────────────────────────────────────────────────────

type SkillTreeData = {
  levels: Array<{
    id: number;
    title: string;
    description: string;
    tiers: Array<{
      id: string;
      title: string;
      atomic_skills: ReadingAtomicSkill[];
    }>;
  }>;
};

const treeData = readingSkillTreeData as unknown as SkillTreeData;

export function getReadingSkillById(skillId: string): ReadingAtomicSkill | null {
  for (const level of treeData.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getReadingLevelById(levelId: number) {
  return treeData.levels.find((l) => l.id === levelId) || null;
}

export function getReadingTierById(tierId: string) {
  for (const level of treeData.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

/**
 * Single source of truth for "user-facing skill name" in reading.
 * Looks up the skill's parent-friendly title from the skill tree. Never returns
 * the raw R{L}.T{T}.A{A} code — falls back to a neutral phrase if the id is
 * not in the tree (which can happen if the calculator emits an id that the
 * authored tree doesn't yet contain).
 */
export function friendlyReadingSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting skill";
  return getReadingSkillById(skillId)?.title ?? "your starting skill";
}

export function getNextReadingSkillId(currentSkillId: string): string | null {
  const parts = currentSkillId.split(".");
  const levelId = parseInt(parts[0].replace("R", ""));
  const tierNum = parseInt(parts[1].replace("T", ""));
  const skillNum = parseInt(parts[2].replace("A", ""));

  const level = getReadingLevelById(levelId);
  if (!level) return null;

  const currentTierId = `${parts[0]}.${parts[1]}`;
  const tier = level.tiers.find((t) => t.id === currentTierId);
  if (tier) {
    const nextSkill = tier.atomic_skills.find(
      (s) => parseInt(s.id.split(".")[2].replace("A", "")) === skillNum + 1
    );
    if (nextSkill) return nextSkill.id;
  }

  const nextTier = level.tiers.find(
    (t) => parseInt(t.id.split(".")[1].replace("T", "")) === tierNum + 1
  );
  if (nextTier && nextTier.atomic_skills.length > 0) {
    return nextTier.atomic_skills[0].id;
  }

  const nextLevel = getReadingLevelById(levelId + 1);
  if (nextLevel && nextLevel.tiers.length > 0 && nextLevel.tiers[0].atomic_skills.length > 0) {
    return nextLevel.tiers[0].atomic_skills[0].id;
  }

  return null;
}

export function getReadingSkillStatus(
  skillId: string,
  profile: ReadingStudentProfile
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile.skill_mastery[skillId];
  if (mastery?.status === "mastered") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";
  const skill = getReadingSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";
  const allMet = skill.prerequisites.every(
    (p) => profile.skill_mastery[p]?.status === "mastered" || profile.skill_mastery[p]?.status === "assumed"
  );
  return allMet ? "available" : "locked";
}

// ─── Needs Review Scan ────────────────────────────────────────────────────────
// Skills mastered more than NEEDS_REVIEW_DAYS ago without recent practice are
// flagged for a one-question retention probe at the start of the next session.

export const NEEDS_REVIEW_DAYS = 7;

/**
 * Scans all mastered skills and marks stale ones as "needs_review".
 * A skill is stale if the most recent of mastered_at / last_reviewed_at /
 * last_attempted is older than NEEDS_REVIEW_DAYS.
 * Returns the profile unchanged if no skills need flagging.
 */
export function scanAndMarkNeedsReview(
  profile: ReadingStudentProfile
): ReadingStudentProfile {
  const cutoff = Date.now() - NEEDS_REVIEW_DAYS * 24 * 60 * 60 * 1000;
  let changed = false;
  const updatedMastery = { ...profile.skill_mastery };

  for (const [skillId, mastery] of Object.entries(updatedMastery)) {
    if (mastery.status !== "mastered") continue;
    // Use the most recent activity timestamp for this skill
    const timestamps = [
      mastery.last_attempted,
      mastery.mastered_at,
      mastery.last_reviewed_at,
    ].filter(Boolean).map((t) => new Date(t!).getTime());
    const mostRecent = Math.max(...timestamps);
    if (mostRecent < cutoff) {
      updatedMastery[skillId] = { ...mastery, status: "needs_review" };
      changed = true;
    }
  }

  if (!changed) return profile;
  const updated = { ...profile, skill_mastery: updatedMastery };
  saveReadingProfile(updated);
  return updated;
}

/**
 * Returns up to one "needs_review" skill ID, prioritising the most stale
 * (longest since any activity). Returns null if none pending.
 */
export function pickNeedsReviewSkill(profile: ReadingStudentProfile): string | null {
  const candidates = Object.values(profile.skill_mastery).filter(
    (m) => m.status === "needs_review"
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const tA = new Date(a.last_reviewed_at ?? a.last_attempted).getTime();
    const tB = new Date(b.last_reviewed_at ?? b.last_attempted).getTime();
    return tA - tB; // oldest first
  });
  return candidates[0].skill_id;
}

/**
 * After a review question is answered, stamps last_reviewed_at and sets
 * status back to "mastered" (if BKT still high) or leaves "in_progress".
 * The BKT update in updateReadingSkillMastery already handles the status —
 * this just stamps the review timestamp.
 */
export function stampReviewedAt(
  profile: ReadingStudentProfile,
  skillId: string
): ReadingStudentProfile {
  const mastery = profile.skill_mastery[skillId];
  if (!mastery) return profile;
  const updated = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: { ...mastery, last_reviewed_at: new Date().toISOString() },
    },
  };
  saveReadingProfile(updated);
  return updated;
}

// ─── Diagnostic Placement ─────────────────────────────────────────────────────

/**
 * Marks placement complete, persists the profile (returns the save promise on
 * `_savePromise` so callers that need the write to land before navigating can
 * await it), and best-effort inserts a diagnostic_results row.
 */
export function completeDiagnosticPlacement(
  profile: ReadingStudentProfile,
  result: DiagnosticPlacementResult
): ReadingStudentProfile & { _savePromise?: Promise<void> } {
  // Mark all auto-completed skills as assumed — inferred from diagnostic, not demonstrated
  const updatedMastery = { ...profile.skill_mastery };
  for (const skillId of result.autoCompletedSkillIds) {
    updatedMastery[skillId] = {
      skill_id: skillId,
      status: "assumed",
      correct_count: 0,
      attempt_count: 0,
      formats_used: [],
      scaffolded_attempts: 0,
      last_attempted: new Date().toISOString(),
      attempts: [],
      p_learned: 0.70,
    };
  }

  // Derive level/tier from entry skill id
  const parts = result.entrySkillId.split(".");
  const levelId = parseInt(parts[0].replace("R", ""));
  const tierId = `${parts[0]}.${parts[1]}`;

  const updated: ReadingStudentProfile & { _savePromise?: Promise<void> } = {
    ...profile,
    placementCompleted: true,
    placement: result,
    skill_mastery: updatedMastery,
    current_skill_id: result.entrySkillId,
    current_tier_id: tierId,
    current_level: levelId,
    last_active: new Date().toISOString(),
  };
  // Expose the save promise so handleViewReport can await it before treating
  // placement as persisted. Non-awaiting callers still work as before.
  updated._savePromise = saveReadingProfile(updated);
  // Supabase sync with retry
  void retrySupabase(() => supabase.from("diagnostic_results").insert({
    student_id: profile.id,
    subject: "reading",
    entry_skill_id: result.entrySkillId,
    entry_level: levelId,
    auto_completed_skill_ids: result.autoCompletedSkillIds,
    dominant_errors: result.dominantErrors ?? [],
    hard_gate_passed: result.hardGatePassed ?? true,
    completed_at: new Date(result.completedAt).toISOString(),
  }));
  return updated;
}

export function getReadingLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, ReadingSkillMastery>
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter((id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed").length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

/** Returns the list of pool refs already served for a skill this session. */
export function getReadingUsedRefs(profile: ReadingStudentProfile, skillId: string): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

/** Adds a ref to the used list for a skill, saves the profile, and returns the updated profile. */
export function markReadingQuestionUsed(
  profile: ReadingStudentProfile,
  skillId: string,
  ref: string
): ReadingStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: ReadingStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveReadingProfile(updated);
  return updated;
}

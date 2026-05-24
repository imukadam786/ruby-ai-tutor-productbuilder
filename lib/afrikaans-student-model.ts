// ─── Afrikaans FAL student model ──────────────────────────────────────────────
//
// Blends two templates per the subject's split architecture:
//   • Prerequisite-locking + per-skill mastery logic is cloned from
//     lib/reading-student-model.ts (getReadingSkillStatus / level progress) —
//     the Afrikaans tree has real prerequisite chains.
//   • Persistence is localStorage, matching how Life Skills persists progress
//     (components/life-skills/LifeSkillsSession.tsx). Afrikaans FAL is open to
//     all plans and has no auth-bound Supabase profile table, so a self-contained
//     localStorage profile is the reliable "persists across reloads" store.
//
// Mastery rule mirrors Life Skills: a session walks every authored item in a
// skill; mastery is awarded when session accuracy ≥ the skill's pass_threshold.

import afrikaansSkillTreeData from "@/data/afrikaans-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import type {
  AfrikaansAtomicSkill,
  AfrikaansSkillMastery,
  AfrikaansSkillTree,
  AfrikaansStudentProfile,
} from "@/types/afrikaans";

const STORAGE_KEY = "afrikaans-fal-profile-v1";
const SUBJECT = "afrikaans-fal";

const tree = afrikaansSkillTreeData as unknown as AfrikaansSkillTree;

// ─── Load / Save (localStorage) ───────────────────────────────────────────────

export function loadAfrikaansProfile(): AfrikaansStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AfrikaansStudentProfile;
  } catch {
    return null;
  }
}

export function saveAfrikaansProfile(profile: AfrikaansStudentProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota or disabled — ignore */
  }
  // Mirror to Supabase so progress restores across devices / cleared storage,
  // exactly like Maths (lib/student-model.ts) and Reading. Fire-and-forget —
  // localStorage stays the working store; the cloud row is the backup.
  void (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      void retrySupabase(() => supabase.from("student_profiles").upsert({
        id: profile.id,
        subject: SUBJECT,
        name: profile.name,
        grade: profile.grade,
        ...(user?.id ? { auth_user_id: user.id } : {}),
        profile_data: profile as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" }));
    } catch {
      /* non-critical */
    }
  })();
}

/**
 * Links this profile to the currently authenticated Supabase user so
 * hydrateAfrikaansProfileFromSupabase() can later restore it. Fire-and-forget;
 * no-op when not authenticated. Mirrors lib/student-model.ts.
 */
export async function linkAfrikaansProfileToAuth(profileId: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    void retrySupabase(() =>
      supabase.from("student_profiles")
        .update({ auth_user_id: user.id })
        .eq("id", profileId),
    );
  } catch {
    /* non-critical */
  }
}

/**
 * When localStorage is empty (e.g. a new device or cleared data), queries
 * Supabase for the most recent Afrikaans profile linked to the authenticated
 * user and returns it. Returns null if not authenticated or none found.
 * Caller is responsible for writing it back to localStorage.
 */
export async function hydrateAfrikaansProfileFromSupabase(): Promise<AfrikaansStudentProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;
    const { data } = await supabase
      .from("student_profiles")
      .select("profile_data")
      .eq("auth_user_id", user.id)
      .eq("subject", SUBJECT)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data?.profile_data) return null;
    return data.profile_data as unknown as AfrikaansStudentProfile;
  } catch {
    return null;
  }
}

export function createAfrikaansProfile(name: string, grade: number): AfrikaansStudentProfile {
  const profile: AfrikaansStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `af_${Date.now()}`,
    name,
    grade,
    current_level: grade,
    current_skill_id: `AF.G${grade}.LUI.01`,
    skill_mastery: {},
    session_count: 1,
    total_attempts: 0,
    total_correct: 0,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    used_questions: {},
  };
  saveAfrikaansProfile(profile);
  return profile;
}

/** Load the stored profile, or create one for the given grade if none exists. */
export function getOrCreateAfrikaansProfile(grade: number, name = "Learner"): AfrikaansStudentProfile {
  return loadAfrikaansProfile() ?? createAfrikaansProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getAfrikaansSkillById(skillId: string): AfrikaansAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getAfrikaansLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getAfrikaansTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

/** User-facing name for a skill id, never the raw AF.G{n}.{strand}.{nn} code. */
export function friendlyAfrikaansSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting skill";
  return getAfrikaansSkillById(skillId)?.title ?? "your starting skill";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initAfrikaansSkillMastery(skillId: string): AfrikaansSkillMastery {
  return {
    skill_id: skillId,
    status: "available",
    correct_count: 0,
    attempt_count: 0,
    formats_used: [],
    last_attempted: new Date().toISOString(),
  };
}

/**
 * Status of a skill for the tree UI. Cloned from getReadingSkillStatus:
 * a skill is "available" only when all its prerequisites are mastered (or
 * assumed). Prerequisite-less skills are always available.
 */
export function getAfrikaansSkillStatus(
  skillId: string,
  profile: AfrikaansStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getAfrikaansSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

/** Marks a skill in_progress on first interaction (no-op once mastered). */
export function markAfrikaansSkillInProgress(
  profile: AfrikaansStudentProfile,
  skillId: string,
): AfrikaansStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: AfrikaansStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initAfrikaansSkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveAfrikaansProfile(updated);
  return updated;
}

/**
 * Records the end-of-session result for a skill: rolls up totals, sets the
 * mastery status, and persists. `mastered` is decided by the caller from
 * accuracy ≥ pass_threshold so that completing a skill unlocks its dependants.
 */
export function recordAfrikaansSkillResult(
  profile: AfrikaansStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): AfrikaansStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initAfrikaansSkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: AfrikaansStudentProfile = {
    ...profile,
    total_attempts: profile.total_attempts + result.attempts,
    total_correct: profile.total_correct + result.correct,
    last_active: new Date().toISOString(),
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...existing,
        status,
        correct_count: existing.correct_count + result.correct,
        attempt_count: existing.attempt_count + result.attempts,
        last_attempted: new Date().toISOString(),
        mastered_at:
          result.mastered && existing.status !== "mastered"
            ? new Date().toISOString()
            : existing.mastered_at,
      },
    },
  };
  saveAfrikaansProfile(updated);
  return updated;
}

/** Percentage of the given skill ids that are mastered/assumed. */
export function getAfrikaansLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, AfrikaansSkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getAfrikaansUsedRefs(profile: AfrikaansStudentProfile, skillId: string): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markAfrikaansQuestionUsed(
  profile: AfrikaansStudentProfile,
  skillId: string,
  ref: string,
): AfrikaansStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: AfrikaansStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveAfrikaansProfile(updated);
  return updated;
}

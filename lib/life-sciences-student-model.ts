// ─── Life Sciences student model ──────────────────────────────────────────────
//
// FET content subject (Grades 10–12). Hybrid template:
//   • Prerequisite-locking + per-skill mastery is cloned from the Afrikaans /
//     Reading shape — the Life Sciences tree has real prerequisite chains.
//   • Persistence is localStorage with a Supabase backup mirror, identical to
//     the Afrikaans pattern.
//
// FET rule (matches English Gr 7–12): no timer, pass mark 0.6 per skill,
// 20-item target pool. Mastery is decided by the caller from
// accuracy ≥ pass_threshold over a full session.

import lifeSciencesSkillTreeData from "@/data/life-sciences-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { seedForGrade } from "@/lib/life-sciences-grade-map";
import type {
  LifeSciencesAtomicSkill,
  LifeSciencesSkillMastery,
  LifeSciencesSkillTree,
  LifeSciencesStudentProfile,
} from "@/types/life-sciences";

const STORAGE_KEY = "life-sciences-profile-v1";
const SUBJECT = "life-sciences";

const tree = lifeSciencesSkillTreeData as unknown as LifeSciencesSkillTree;

// ─── Load / Save (localStorage + Supabase mirror) ─────────────────────────────

export function loadLifeSciencesProfile(): LifeSciencesStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LifeSciencesStudentProfile;
  } catch {
    return null;
  }
}

export function saveLifeSciencesProfile(profile: LifeSciencesStudentProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota or disabled — ignore */
  }
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

export async function linkLifeSciencesProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateLifeSciencesProfileFromSupabase(): Promise<LifeSciencesStudentProfile | null> {
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
    return data.profile_data as unknown as LifeSciencesStudentProfile;
  } catch {
    return null;
  }
}

export function createLifeSciencesProfile(name: string, grade: number): LifeSciencesStudentProfile {
  const seed = seedForGrade(grade);
  const profile: LifeSciencesStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `lsc_${Date.now()}`,
    name,
    grade,
    current_level: seed.level,
    current_skill_id: seed.entrySkillId,
    skill_mastery: {},
    session_count: 1,
    total_attempts: 0,
    total_correct: 0,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    used_questions: {},
  };
  saveLifeSciencesProfile(profile);
  return profile;
}

export function getOrCreateLifeSciencesProfile(grade: number, name = "Learner"): LifeSciencesStudentProfile {
  return loadLifeSciencesProfile() ?? createLifeSciencesProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getLifeSciencesSkillById(skillId: string): LifeSciencesAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getLifeSciencesLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getLifeSciencesTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function friendlyLifeSciencesSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting topic";
  return getLifeSciencesSkillById(skillId)?.title ?? "your starting topic";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initLifeSciencesSkillMastery(skillId: string): LifeSciencesSkillMastery {
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
 * Status for the tree UI. A skill is `available` only when all its
 * prerequisites are mastered (or assumed). Prerequisite-less skills are always
 * available within their grade level.
 */
export function getLifeSciencesSkillStatus(
  skillId: string,
  profile: LifeSciencesStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getLifeSciencesSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

export function markLifeSciencesSkillInProgress(
  profile: LifeSciencesStudentProfile,
  skillId: string,
): LifeSciencesStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: LifeSciencesStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initLifeSciencesSkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveLifeSciencesProfile(updated);
  return updated;
}

/**
 * Records end-of-session result. Caller decides `mastered` from
 * accuracy ≥ pass_threshold (0.6 for FET).
 */
export function recordLifeSciencesSkillResult(
  profile: LifeSciencesStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): LifeSciencesStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initLifeSciencesSkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: LifeSciencesStudentProfile = {
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
  saveLifeSciencesProfile(updated);
  return updated;
}

export function getLifeSciencesLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, LifeSciencesSkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getLifeSciencesUsedRefs(
  profile: LifeSciencesStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markLifeSciencesQuestionUsed(
  profile: LifeSciencesStudentProfile,
  skillId: string,
  ref: string,
): LifeSciencesStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: LifeSciencesStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveLifeSciencesProfile(updated);
  return updated;
}

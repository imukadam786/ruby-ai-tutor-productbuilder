// ─── Tourism student model ────────────────────────────────────────────────────
//
// FET content subject (Grades 10–12). Direct mirror of
// lib/life-sciences-student-model.ts.
//
// FET rule: no timer, pass mark 0.6 per skill, 20-item target pool. Mastery
// is decided by the caller from accuracy ≥ pass_threshold over a full session.

import tourismSkillTreeData from "@/data/tourism-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { seedForGrade } from "@/lib/tourism-grade-map";
import type {
  TourismAtomicSkill,
  TourismSkillMastery,
  TourismSkillTree,
  TourismStudentProfile,
} from "@/types/tourism";

const STORAGE_KEY = "tourism-profile-v1";
const SUBJECT = "tourism";

const tree = tourismSkillTreeData as unknown as TourismSkillTree;

// ─── Load / Save (localStorage + Supabase mirror) ─────────────────────────────

export function loadTourismProfile(): TourismStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TourismStudentProfile;
  } catch {
    return null;
  }
}

export function saveTourismProfile(profile: TourismStudentProfile): void {
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

export async function linkTourismProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateTourismProfileFromSupabase(): Promise<TourismStudentProfile | null> {
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
    return data.profile_data as unknown as TourismStudentProfile;
  } catch {
    return null;
  }
}

export function createTourismProfile(name: string, grade: number): TourismStudentProfile {
  const seed = seedForGrade(grade);
  const profile: TourismStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `tour_${Date.now()}`,
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
  saveTourismProfile(profile);
  return profile;
}

export function getOrCreateTourismProfile(grade: number, name = "Learner"): TourismStudentProfile {
  return loadTourismProfile() ?? createTourismProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getTourismSkillById(skillId: string): TourismAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getTourismLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getTourismTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function friendlyTourismSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting topic";
  return getTourismSkillById(skillId)?.title ?? "your starting topic";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initTourismSkillMastery(skillId: string): TourismSkillMastery {
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
 * available within their grade level. (Grade 10's tree has no prereqs, so
 * everything is open from day one — locked status will surface if/when
 * future grades introduce chains.)
 */
export function getTourismSkillStatus(
  skillId: string,
  profile: TourismStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getTourismSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

export function markTourismSkillInProgress(
  profile: TourismStudentProfile,
  skillId: string,
): TourismStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: TourismStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initTourismSkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveTourismProfile(updated);
  return updated;
}

/**
 * Records end-of-session result. Caller decides `mastered` from
 * accuracy ≥ pass_threshold (0.6 for FET).
 */
export function recordTourismSkillResult(
  profile: TourismStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): TourismStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initTourismSkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: TourismStudentProfile = {
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
  saveTourismProfile(updated);
  return updated;
}

export function getTourismLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, TourismSkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getTourismUsedRefs(
  profile: TourismStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markTourismQuestionUsed(
  profile: TourismStudentProfile,
  skillId: string,
  ref: string,
): TourismStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: TourismStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveTourismProfile(updated);
  return updated;
}

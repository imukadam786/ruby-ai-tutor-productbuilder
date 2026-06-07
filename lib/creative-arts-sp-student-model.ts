// ─── Natural Sciences SP student model ────────────────────────────────────────
//
// Senior-Phase content subject (Grades 7–9). Direct mirror of
// lib/geography-student-model.ts.
//
// Content-subject rule: no timer, pass mark 0.6 per skill, 20-item target pool.
// Mastery is decided by the caller from cumulative coverage + accuracy (see
// lib/content-mastery.ts). Every pool ships ungated (gate "NONE",
// prerequisites []), so every skill is "available" from day one.

import creativeArtsSpSkillTreeData from "@/data/creative-arts-sp-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { seedForGrade } from "@/lib/creative-arts-sp-grade-map";
import type {
  CreativeArtsSpAtomicSkill,
  CreativeArtsSpSkillMastery,
  CreativeArtsSpSkillTree,
  CreativeArtsSpStudentProfile,
} from "@/types/creative-arts-sp";

const STORAGE_KEY = "creative-arts-sp-profile-v1";
const SUBJECT = "creative-arts-sp";

const tree = creativeArtsSpSkillTreeData as unknown as CreativeArtsSpSkillTree;

// ─── Load / Save (localStorage + Supabase mirror) ─────────────────────────────

export function loadCreativeArtsSpProfile(): CreativeArtsSpStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CreativeArtsSpStudentProfile;
  } catch {
    return null;
  }
}

export function saveCreativeArtsSpProfile(profile: CreativeArtsSpStudentProfile): void {
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

export async function linkCreativeArtsSpProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateCreativeArtsSpProfileFromSupabase(): Promise<CreativeArtsSpStudentProfile | null> {
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
    return data.profile_data as unknown as CreativeArtsSpStudentProfile;
  } catch {
    return null;
  }
}

export function createCreativeArtsSpProfile(name: string, grade: number): CreativeArtsSpStudentProfile {
  const seed = seedForGrade(grade);
  const profile: CreativeArtsSpStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ca_${Date.now()}`,
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
  saveCreativeArtsSpProfile(profile);
  return profile;
}

export function getOrCreateCreativeArtsSpProfile(grade: number, name = "Learner"): CreativeArtsSpStudentProfile {
  return loadCreativeArtsSpProfile() ?? createCreativeArtsSpProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getCreativeArtsSpSkillById(skillId: string): CreativeArtsSpAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getCreativeArtsSpLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getCreativeArtsSpTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function friendlyCreativeArtsSpSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting topic";
  return getCreativeArtsSpSkillById(skillId)?.title ?? "your starting topic";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initCreativeArtsSpSkillMastery(skillId: string): CreativeArtsSpSkillMastery {
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
 * Status for the tree UI. A skill is `available` once all its prerequisites are
 * mastered (or assumed). Natural Sciences SP ships every skill with no
 * prerequisites, so everything is open from day one — the locked branch only
 * ever fires if a future grade introduces chains.
 */
export function getCreativeArtsSpSkillStatus(
  skillId: string,
  profile: CreativeArtsSpStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getCreativeArtsSpSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

export function markCreativeArtsSpSkillInProgress(
  profile: CreativeArtsSpStudentProfile,
  skillId: string,
): CreativeArtsSpStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: CreativeArtsSpStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initCreativeArtsSpSkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveCreativeArtsSpProfile(updated);
  return updated;
}

/**
 * Records end-of-session result. Caller decides `mastered` from cumulative
 * coverage + accuracy (content-mastery engine).
 */
export function recordCreativeArtsSpSkillResult(
  profile: CreativeArtsSpStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): CreativeArtsSpStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initCreativeArtsSpSkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: CreativeArtsSpStudentProfile = {
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
  saveCreativeArtsSpProfile(updated);
  return updated;
}

export function getCreativeArtsSpLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, CreativeArtsSpSkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getCreativeArtsSpUsedRefs(
  profile: CreativeArtsSpStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markCreativeArtsSpQuestionUsed(
  profile: CreativeArtsSpStudentProfile,
  skillId: string,
  ref: string,
): CreativeArtsSpStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: CreativeArtsSpStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveCreativeArtsSpProfile(updated);
  return updated;
}

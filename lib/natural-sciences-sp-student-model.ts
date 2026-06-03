// ─── Natural Sciences SP student model ────────────────────────────────────────
//
// Senior-Phase content subject (Grades 7–9). Direct mirror of
// lib/geography-student-model.ts.
//
// Content-subject rule: no timer, pass mark 0.6 per skill, 20-item target pool.
// Mastery is decided by the caller from cumulative coverage + accuracy (see
// lib/content-mastery.ts). Every pool ships ungated (gate "NONE",
// prerequisites []), so every skill is "available" from day one.

import naturalSciencesSpSkillTreeData from "@/data/natural-sciences-sp-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { seedForGrade } from "@/lib/natural-sciences-sp-grade-map";
import type {
  NaturalSciencesSpAtomicSkill,
  NaturalSciencesSpSkillMastery,
  NaturalSciencesSpSkillTree,
  NaturalSciencesSpStudentProfile,
} from "@/types/natural-sciences-sp";

const STORAGE_KEY = "natural-sciences-sp-profile-v1";
const SUBJECT = "natural-sciences-sp";

const tree = naturalSciencesSpSkillTreeData as unknown as NaturalSciencesSpSkillTree;

// ─── Load / Save (localStorage + Supabase mirror) ─────────────────────────────

export function loadNaturalSciencesSpProfile(): NaturalSciencesSpStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NaturalSciencesSpStudentProfile;
  } catch {
    return null;
  }
}

export function saveNaturalSciencesSpProfile(profile: NaturalSciencesSpStudentProfile): void {
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

export async function linkNaturalSciencesSpProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateNaturalSciencesSpProfileFromSupabase(): Promise<NaturalSciencesSpStudentProfile | null> {
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
    return data.profile_data as unknown as NaturalSciencesSpStudentProfile;
  } catch {
    return null;
  }
}

export function createNaturalSciencesSpProfile(name: string, grade: number): NaturalSciencesSpStudentProfile {
  const seed = seedForGrade(grade);
  const profile: NaturalSciencesSpStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `nssp_${Date.now()}`,
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
  saveNaturalSciencesSpProfile(profile);
  return profile;
}

export function getOrCreateNaturalSciencesSpProfile(grade: number, name = "Learner"): NaturalSciencesSpStudentProfile {
  return loadNaturalSciencesSpProfile() ?? createNaturalSciencesSpProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getNaturalSciencesSpSkillById(skillId: string): NaturalSciencesSpAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getNaturalSciencesSpLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getNaturalSciencesSpTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function friendlyNaturalSciencesSpSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting topic";
  return getNaturalSciencesSpSkillById(skillId)?.title ?? "your starting topic";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initNaturalSciencesSpSkillMastery(skillId: string): NaturalSciencesSpSkillMastery {
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
export function getNaturalSciencesSpSkillStatus(
  skillId: string,
  profile: NaturalSciencesSpStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getNaturalSciencesSpSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

export function markNaturalSciencesSpSkillInProgress(
  profile: NaturalSciencesSpStudentProfile,
  skillId: string,
): NaturalSciencesSpStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: NaturalSciencesSpStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initNaturalSciencesSpSkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveNaturalSciencesSpProfile(updated);
  return updated;
}

/**
 * Records end-of-session result. Caller decides `mastered` from cumulative
 * coverage + accuracy (content-mastery engine).
 */
export function recordNaturalSciencesSpSkillResult(
  profile: NaturalSciencesSpStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): NaturalSciencesSpStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initNaturalSciencesSpSkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: NaturalSciencesSpStudentProfile = {
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
  saveNaturalSciencesSpProfile(updated);
  return updated;
}

export function getNaturalSciencesSpLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, NaturalSciencesSpSkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getNaturalSciencesSpUsedRefs(
  profile: NaturalSciencesSpStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markNaturalSciencesSpQuestionUsed(
  profile: NaturalSciencesSpStudentProfile,
  skillId: string,
  ref: string,
): NaturalSciencesSpStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: NaturalSciencesSpStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveNaturalSciencesSpProfile(updated);
  return updated;
}

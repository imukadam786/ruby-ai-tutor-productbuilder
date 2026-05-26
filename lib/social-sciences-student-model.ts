// ─── Social Sciences student model ────────────────────────────────────────────
// Mirrors lib/life-skills-student-model.ts: a single serialized profile is the
// unit of progress. localStorage is the working store; every save also upserts
// to Supabase `student_profiles` (subject "social-sciences") so progress
// restores across devices.

import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";

const STORAGE_KEY = "social-sciences-profile-v1";
const SUBJECT = "social-sciences";

export type SocialSciencesTopicStatus = "available" | "in_progress" | "mastered";

export interface SocialSciencesProfile {
  id: string;
  name: string;
  grade: number;
  mastery: Record<string, SocialSciencesTopicStatus>;
  used_questions: Record<string, string[]>;
  total_attempts: number;
  total_correct: number;
  session_count: number;
  created_at: string;
  last_active: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `ss_${Date.now()}`;
}

export function loadSocialSciencesProfile(): SocialSciencesProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SocialSciencesProfile;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveSocialSciencesProfile(profile: SocialSciencesProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota — ignore */
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

export function createSocialSciencesProfile(name: string, grade: number): SocialSciencesProfile {
  const now = new Date().toISOString();
  const profile: SocialSciencesProfile = {
    id: newId(),
    name,
    grade,
    mastery: {},
    used_questions: {},
    total_attempts: 0,
    total_correct: 0,
    session_count: 1,
    created_at: now,
    last_active: now,
  };
  saveSocialSciencesProfile(profile);
  return profile;
}

export function getOrCreateSocialSciencesProfile(grade: number, name = "Learner"): SocialSciencesProfile {
  const existing = loadSocialSciencesProfile();
  if (!existing) return createSocialSciencesProfile(name, grade);
  const refreshed: SocialSciencesProfile = {
    ...existing,
    name: name || existing.name,
    grade: grade || existing.grade,
    last_active: new Date().toISOString(),
  };
  saveSocialSciencesProfile(refreshed);
  return refreshed;
}

export async function linkSocialSciencesProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateSocialSciencesProfileFromSupabase(): Promise<SocialSciencesProfile | null> {
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
    return data.profile_data as unknown as SocialSciencesProfile;
  } catch {
    return null;
  }
}

export function getSocialSciencesMasteryMap(): Record<string, SocialSciencesTopicStatus> {
  return loadSocialSciencesProfile()?.mastery ?? {};
}

export function getSocialSciencesUsedRefs(skillId: string): string[] {
  return loadSocialSciencesProfile()?.used_questions?.[skillId] ?? [];
}

export function recordSocialSciencesAnswer(skillId: string, questionRef: string, isCorrect: boolean): void {
  const profile = loadSocialSciencesProfile();
  if (!profile) return;
  const existingRefs = profile.used_questions[skillId] ?? [];
  const updated: SocialSciencesProfile = {
    ...profile,
    used_questions: {
      ...profile.used_questions,
      [skillId]: [...existingRefs, questionRef],
    },
    total_attempts: profile.total_attempts + 1,
    total_correct: profile.total_correct + (isCorrect ? 1 : 0),
    last_active: new Date().toISOString(),
  };
  saveSocialSciencesProfile(updated);
}

export function setSocialSciencesMastery(skillId: string, status: SocialSciencesTopicStatus): void {
  const profile = loadSocialSciencesProfile();
  if (!profile) return;
  if (profile.mastery[skillId] === status) return;
  const updated: SocialSciencesProfile = {
    ...profile,
    mastery: { ...profile.mastery, [skillId]: status },
    last_active: new Date().toISOString(),
  };
  saveSocialSciencesProfile(updated);
}

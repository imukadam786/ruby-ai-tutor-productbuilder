// ─── lib/onboarding-reader.ts ────────────────────────────────────────────────
// Reads onboarding data (name + grade + FET subjects) from the Supabase users table.

import { supabase } from "@/lib/supabase";
import type { FetSubjectKey } from "@/lib/fet-subjects";

export interface OnboardingData {
  name: string;
  grade: number;
  // The learner's saved FET (Gr 10–12) subject picks, or null when none were
  // saved (Grades 1–9, or any account created before subject selection shipped).
  // Null means "show all" — the Subjects hub fails open.
  subjects: FetSubjectKey[] | null;
}

/**
 * Fetches authoritative name, grade and subjects from the Supabase users table.
 * Returns null if unauthenticated or no row found.
 */
export async function fetchAuthorisedGrade(): Promise<OnboardingData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("users")
      .select("full_name, grade, subjects")
      .eq("id", user.id)
      .single();
    if (data) {
      const name = ((data.full_name as string) || "Student").split(" ")[0];
      const parsed = parseInt(data.grade as string, 10);
      const grade = !isNaN(parsed) && parsed >= 1 && parsed <= 12 ? parsed : null;
      const rawSubjects = data.subjects as string[] | null;
      const subjects = Array.isArray(rawSubjects) && rawSubjects.length
        ? (rawSubjects as FetSubjectKey[])
        : null;
      if (grade !== null) return { name, grade, subjects };
    }
  } catch { /* network failure */ }
  return null;
}

// ─── lib/onboarding-reader.ts ────────────────────────────────────────────────
// Reads onboarding data (name + grade) from the Supabase users table.

import { supabase } from "@/lib/supabase";

export interface OnboardingData {
  name: string;
  grade: number;
}

/**
 * Fetches authoritative name and grade from the Supabase users table.
 * Returns null if unauthenticated or no row found.
 */
export async function fetchAuthorisedGrade(): Promise<OnboardingData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("users")
      .select("full_name, grade")
      .eq("id", user.id)
      .single();
    if (data) {
      const name = ((data.full_name as string) || "Student").split(" ")[0];
      const parsed = parseInt(data.grade as string, 10);
      const grade = !isNaN(parsed) && parsed >= 1 && parsed <= 12 ? parsed : null;
      if (grade !== null) return { name, grade };
    }
  } catch { /* network failure */ }
  return null;
}

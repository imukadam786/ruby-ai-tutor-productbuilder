// ─── lib/onboarding-reader.ts ────────────────────────────────────────────────
// Pure onboarding data parser, injectable storage for testability.

export interface OnboardingData {
  name: string;
  grade: number;
}

/**
 * Parses raw JSON string from storage into validated onboarding data.
 * Returns null when absent, unparseable, or grade is out of range.
 */
export function parseOnboardingJson(raw: string | null): OnboardingData | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    const name = ((data.name as string) || "Student").split(" ")[0];
    const parsed = parseInt(data.grade as string, 10);
    const grade = !isNaN(parsed) && parsed >= 1 && parsed <= 12 ? parsed : null;
    if (grade === null) return null;
    return { name, grade };
  } catch {
    return null;
  }
}

/**
 * Reads onboarding data from localStorage.
 * Returns null when absent or invalid — never falls back to a fake grade.
 */
export function readOnboarding(): OnboardingData | null {
  try {
    return parseOnboardingJson(localStorage.getItem("onboardingData"));
  } catch {
    return null;
  }
}

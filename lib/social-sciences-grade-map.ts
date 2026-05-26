// ─── Social Sciences grade → entry-level map ──────────────────────────────────
// Social Sciences in CAPS only exists from Grade 4 onwards. Foundation Phase
// (Gr 1–3) has no Social Sciences subject — Beginning Knowledge & Health
// (under Life Skills) covers similar ground at that level.
//
// Intermediate Phase Grades 4–6 cover two strands per grade: History (HIS)
// and Geography (GEO). Map skills topics and History project topics are out
// of scope for this MCQ-based tutor. Senior Phase (Gr 7+) is out of scope.
//
// Like Life Skills, this subject does NOT run a placement test. Learners
// self-report grade in onboarding and land directly on that grade's tree;
// all topics for that grade are unlocked from day one.

export const HIGHEST_AVAILABLE_LEVEL = 6;
export const LOWEST_AVAILABLE_LEVEL = 4;

export interface SocialSciencesEntrySeed {
  /** Skill-tree level (4–6). */
  level: number;
  /** True when the learner's grade is above the content we have (Gr 7+). */
  beyondContent: boolean;
  /** True when the learner's grade is below the content we have (Gr 1–3). */
  belowContent: boolean;
}

const GRADE_TO_LEVEL: Record<number, number> = { 4: 4, 5: 5, 6: 6 };

export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 4;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 4;
}

export function seedForGrade(grade: string | number | null | undefined): SocialSciencesEntrySeed {
  const g = normaliseGrade(grade);
  const belowContent = g < LOWEST_AVAILABLE_LEVEL;
  const beyondContent = g > HIGHEST_AVAILABLE_LEVEL;
  const level = belowContent
    ? LOWEST_AVAILABLE_LEVEL
    : beyondContent
    ? HIGHEST_AVAILABLE_LEVEL
    : GRADE_TO_LEVEL[g] ?? LOWEST_AVAILABLE_LEVEL;
  return { level, beyondContent, belowContent };
}

// ─── Afrikaans FAL grade → level map ──────────────────────────────────────────
// Foundation + Intermediate Phase (Grades 1–6) PLUS FET Grade 10. Unlike
// English/Maths there is NO placement engine: learners' grade is known from
// onboarding, so we trust the self-reported grade and send them straight to
// that grade's tree. (Same decision as Life Skills — see lib/life-skills-grade-map.ts.)
//
// Built levels: L1–L6 = Grades 1–6, L7–L9 = Grades 7–9 (CAPS Senior Phase FAL,
// immersive), and L10–L12 = Grades 10–12 (CAPS FET FAL). The full Grades 1–12
// ladder is now authored. For any grade with no built content we fall back to the
// nearest available level AT OR BELOW the grade and flag `beyondContent` so callers
// can surface a "more grades coming" state. Grade R is treated as Grade 1 entry
// (FAL formally starts in Grade 1).

// Levels that actually have authored tree + bank content, ascending.
const AVAILABLE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const HIGHEST_AVAILABLE_LEVEL = 12; // Gr 1-12 authored

export interface AfrikaansEntrySeed {
  /** Skill-tree level to start at (one of AVAILABLE_LEVELS). */
  level: number;
  /** First strand entry skill of that level if the learner just dives in. */
  entrySkillId: string;
  /** True when the learner's grade has no authored content (gap or above). */
  beyondContent: boolean;
}

// Grade → level for grades that map cleanly onto built content.
const GRADE_TO_LEVEL: Record<number, number> = {
  0: 1, // Grade R → Grade 1 entry
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7, // CAPS Senior Phase FAL Grade 7 (immersive)
  8: 8, // CAPS Senior Phase FAL Grade 8
  9: 9, // CAPS Senior Phase FAL Grade 9
  10: 10, // CAPS FET FAL Grade 10
  11: 11, // CAPS FET FAL Grade 11
  12: 12, // CAPS FET FAL Grade 12 (Matric)
};

/** Normalise the onboarding grade (string "1".."12" or "R") to a number. */
export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 1;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 1;
}

export function seedForGrade(grade: string | number | null | undefined): AfrikaansEntrySeed {
  const g = normaliseGrade(grade);
  const mapped = GRADE_TO_LEVEL[g];
  // Grade has built content → use it directly.
  if (mapped != null) {
    return { level: mapped, entrySkillId: `AF.G${mapped}.LUI.01`, beyondContent: false };
  }
  // No built content (e.g. a grade above the authored ladder):
  // fall back to the nearest available level at or below the grade.
  const fallback = [...AVAILABLE_LEVELS].reverse().find((l) => l <= g) ?? AVAILABLE_LEVELS[0];
  // Listening is the natural on-ramp for an additional language, so entry
  // starts at the first Luister skill of the level.
  return { level: fallback, entrySkillId: `AF.G${fallback}.LUI.01`, beyondContent: true };
}

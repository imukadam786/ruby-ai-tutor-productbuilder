// ─── English (Reading) grade → entry-level map ────────────────────────────────
// Onboarding captures a grade (1–12, or "R"). That seeds WHERE the Discovery
// activity starts probing — it is a hypothesis, not a final placement. The
// reading placement calculator confirms or adjusts up/down from this seed so a
// Grade-6 learner never re-does phonics and a struggling learner can drop back.
//
// Content spans Levels 1–14 (Grade R–12). L1–L8 = Foundation/Intermediate
// (runtime + L6/L7/L8 banks). L9–L11 = Senior Phase (Grades 7–9). L12–L14 =
// FET Phase (Grades 10–12). `beyondContent` is now only true for inputs above
// Grade 12 (defensive — onboarding shouldn't produce them).

export const HIGHEST_AVAILABLE_LEVEL = 14;

export interface EnglishEntrySeed {
  /** Skill-tree level to begin Discovery probing from (1–8). */
  level: number;
  /** First skill of that level — entry point if Discovery isn't taken. */
  entrySkillId: string;
  /** True when the learner's grade is above the content we have (Gr 7–12).
   *  UI: allow entry at L8 and surface a "more grades coming" state. */
  beyondContent: boolean;
}

// Grade → seed level. Reading levels by CAPS grade band:
//   L1 Gr R–1 · L2 Gr 1 · L3 Gr 2 · L4 Gr 2–3 · L5 Gr 3
//   L6 Gr 4   · L7 Gr 5 · L8 Gr 6
//   L9 Gr 7   · L10 Gr 8 · L11 Gr 9   (Senior Phase)
//   L12 Gr 10 · L13 Gr 11 · L14 Gr 12 (FET Phase)
const GRADE_TO_LEVEL: Record<number, number> = {
  0: 1, 1: 1,   // Grade R / 1 → foundational oral & phonological
  2: 3,         // Grade 2 → encoding consolidation
  3: 5,         // Grade 3 → comprehension & language expansion
  4: 6,         // Grade 4 → transition to academic reading
  5: 7,         // Grade 5 → organised meaning & structured writing
  6: 8,         // Grade 6 → early academic reasoning
  7: 9,         // Grade 7 → analytical reading foundations
  8: 10,        // Grade 8 → evaluative & argumentative control
  9: 11,        // Grade 9 → academic independence & synthesis
  10: 12,       // Grade 10 → academic transition (FET)
  11: 13,       // Grade 11 → pre-exam maturity (FET)
  12: 14,       // Grade 12 → NSC exit standard (FET)
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

export function seedForGrade(grade: string | number | null | undefined): EnglishEntrySeed {
  const g = normaliseGrade(grade);
  const beyondContent = g > 12;
  const level = beyondContent
    ? HIGHEST_AVAILABLE_LEVEL
    : GRADE_TO_LEVEL[g] ?? HIGHEST_AVAILABLE_LEVEL;
  return { level, entrySkillId: `R${level}.T1.A1`, beyondContent };
}

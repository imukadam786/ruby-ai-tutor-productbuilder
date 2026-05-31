// ─── Life Sciences grade → entry-level map ────────────────────────────────────
// Onboarding captures a grade (R, 1–12). Life Sciences is a FET subject:
// Grades 10, 11 and 12 only. CAPS sequences topics by term but they all unlock
// once the grade is selected — the UI just surfaces the "current" topic
// (next unfinished in CAPS term order) and the immediately following ones.
//
// FET rule: no timer, 60% pass mark per pool (same as English FET).
//
// Life Sciences is NOT placement-tested. The learner self-reports grade in
// onboarding; sub-grade nudges (the kid is mid-grade) are handled by the UI,
// not by this map.

export const HIGHEST_AVAILABLE_LEVEL = 12;
export const LOWEST_AVAILABLE_LEVEL = 10;

export interface LifeSciencesEntrySeed {
  /** Skill-tree level (10–12). */
  level: number;
  /** First atomic skill of that grade in CAPS teaching order.
   *  G10: Chemistry of life → Inorganic compounds.
   *  G11: Biodiversity of microorganisms (Strand 4 taught first).
   *  G12: DNA: code of life. */
  entrySkillId: string;
  /** True when the learner's grade is above the content we have (>12). */
  beyondContent: boolean;
  /** True when the learner's grade is below the content we have (<10).
   *  Junior/Senior Phase learners doing Natural Sciences — surface
   *  "Life Sciences starts in Grade 10" and offer L10 as the floor. */
  belowContent: boolean;
}

// Grade → tree level. FET Life Sciences only.
const GRADE_TO_LEVEL: Record<number, number> = {
  10: 10,
  11: 11,
  12: 12,
};

// Each grade's CAPS-order entry skill — drives the "Start here" card.
const ENTRY_SKILL: Record<number, string> = {
  10: "LSC.G10.S1.CHEM.A1",
  11: "LSC.G11.S4.MICR.A1",
  12: "LSC.G12.S1.DNA.A1",
};

/** Normalise the onboarding grade ("10".."12", possibly "Grade 11") to a
 *  number. Returns 0 for non-numeric (so below-content branch fires). */
export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 0;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export function seedForGrade(grade: string | number | null | undefined): LifeSciencesEntrySeed {
  const g = normaliseGrade(grade);
  const belowContent = g < LOWEST_AVAILABLE_LEVEL;
  const beyondContent = g > HIGHEST_AVAILABLE_LEVEL;
  const level = belowContent
    ? LOWEST_AVAILABLE_LEVEL
    : beyondContent
    ? HIGHEST_AVAILABLE_LEVEL
    : GRADE_TO_LEVEL[g] ?? LOWEST_AVAILABLE_LEVEL;
  return {
    level,
    entrySkillId: ENTRY_SKILL[level] ?? ENTRY_SKILL[LOWEST_AVAILABLE_LEVEL],
    beyondContent,
    belowContent,
  };
}

/** All atomic-skill IDs for a level, in CAPS-term order. The UI can use this
 *  to render the topic list with a "current" highlight (next not-mastered)
 *  and "next" badges for the upcoming ones. */
export function skillsForLevel(level: number): string[] {
  // Resolved at runtime from the tree to avoid duplicating IDs here. The
  // selector / UI typically already loads the tree; this helper is a
  // convenience for places that only have the level number.
  const tree = require("../data/life-sciences-skill-tree.json");
  const lvl = tree.levels.find((l: { id: number }) => l.id === level);
  if (!lvl) return [];
  const ids: string[] = [];
  for (const tier of lvl.tiers ?? []) {
    for (const skill of tier.atomic_skills ?? []) {
      ids.push(skill.id);
    }
  }
  return ids;
}

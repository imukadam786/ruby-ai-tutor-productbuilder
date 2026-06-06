// ─── Technology SP grade → entry-level map ───────────────────────────────────
// Onboarding captures a grade (R, 1–12). Technology is a Senior-Phase subject:
// Grades 7, 8 and 9 only. CAPS sequences content by strand (Design & Graphics,
// Structures, Mechanical Systems, Electrical Systems, Processing) and term, but
// every skill unlocks once the grade is selected (every pool is gate "NONE") —
// the UI just surfaces the "current" skill (next unfinished) and those after it.
//
// Content-subject rule: no timer, 60% pass mark per pool (same as the other
// Senior-Phase subjects — Natural Sciences SP / Social Sciences SP / EMS SP).
//
// Technology is NOT placement-tested. The learner self-reports grade in
// onboarding. Each grade opens on its first Design & Graphics skill (the CAPS
// Term 1 foundation that runs through the whole year).

export const HIGHEST_AVAILABLE_LEVEL = 9;
export const LOWEST_AVAILABLE_LEVEL = 7;

export interface TechnologySpEntrySeed {
  /** Skill-tree level (7–9). */
  level: number;
  /** First atomic skill of that grade in CAPS teaching order. Falls back to
   *  the first skill found in the tree when not hard-coded here. */
  entrySkillId: string;
  /** True when the learner's grade is above the content we have (>9). */
  beyondContent: boolean;
  /** True when the learner's grade is below the content we have (<7). */
  belowContent: boolean;
}

// Grade → tree level. Senior-Phase Technology only.
const GRADE_TO_LEVEL: Record<number, number> = {
  7: 7,
  8: 8,
  9: 9,
};

// Each grade's CAPS-order entry skill — the first Design & Graphics skill opens
// each grade. Empty string = resolve at runtime by reading the first skill from
// the tree.
const ENTRY_SKILL: Record<number, string> = {
  7: "TECH.G7.DG.A1",
  8: "TECH.G8.DG.A1",
  9: "TECH.G9.DG.A1",
};

/** Normalise the onboarding grade ("7".."9", possibly "Grade 8") to a number.
 *  Returns 0 for non-numeric (so below-content branch fires). */
export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 0;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function firstSkillIdForLevel(level: number): string {
  const tree = require("../data/technology-sp-skill-tree.json");
  const lvl = tree.levels.find((l: { id: number }) => l.id === level);
  if (!lvl) return "";
  for (const tier of lvl.tiers ?? []) {
    for (const skill of tier.atomic_skills ?? []) {
      if (skill?.id) return skill.id;
    }
  }
  return "";
}

/** Confirm a hard-coded entry skill actually exists in the tree; fall back to
 *  the first skill of the level otherwise (defensive against id drift). */
function resolveEntrySkill(level: number): string {
  const hard = ENTRY_SKILL[level];
  if (hard && hard.length > 0) {
    const tree = require("../data/technology-sp-skill-tree.json");
    const lvl = tree.levels.find((l: { id: number }) => l.id === level);
    const exists = (lvl?.tiers ?? []).some((t: { atomic_skills?: Array<{ id: string }> }) =>
      (t.atomic_skills ?? []).some((s) => s.id === hard),
    );
    if (exists) return hard;
  }
  return firstSkillIdForLevel(level);
}

export function seedForGrade(grade: string | number | null | undefined): TechnologySpEntrySeed {
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
    entrySkillId: resolveEntrySkill(level),
    beyondContent,
    belowContent,
  };
}

/** All atomic-skill IDs for a level, in CAPS order. */
export function skillsForLevel(level: number): string[] {
  const tree = require("../data/technology-sp-skill-tree.json");
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

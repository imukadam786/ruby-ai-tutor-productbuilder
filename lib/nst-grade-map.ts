// ─── Natural Sciences & Technology grade → entry-level map ───────────────────
// Onboarding captures a grade (R, 1–12). NST covers:
//   - Intermediate Phase Grades 4–6 (Life & Living, Matter & Materials,
//     Energy & Change, Planet Earth & Beyond — one strand per term)
// FP (Gr R–3) Beginning Knowledge sits in Life Skills; SP (Gr 7+) splits into
// Natural Sciences and Technology as separate subjects — out of scope.
//
// Like Life Skills, NST does NOT run a placement test. Learners self-report
// grade in onboarding and land on that grade's tree; all topics for that grade
// are unlocked from day one (CAPS sequences them termly but they do not
// prerequisite each other).
//
// NST is open to all plans (including freebie) — no entitlement check.

export const HIGHEST_AVAILABLE_LEVEL = 6;
export const LOWEST_AVAILABLE_LEVEL = 4;

export interface NstEntrySeed {
  /** Skill-tree level (4–6). */
  level: number;
  /** Entry skill — first topic (Term 1) of that grade. UI may ignore this and
   *  surface the full topic grid since topics are independent. */
  entrySkillId: string;
  /** True when the learner's grade is above the content we have (Gr 7+).
   *  UI: show a "more grades coming" state and offer the closest available
   *  level (L6). */
  beyondContent: boolean;
  /** True when the learner's grade is below the content we have (Gr R–3).
   *  UI: surface "starts at Grade 4" and offer L4 as the floor. */
  belowContent: boolean;
}

// Grade → level. IP only for this subject.
//   Grades R–3 → not covered (closest: L4)
//   Grades 4–6 → L4–L6
//   Grade 7+ → out of scope (separate Nat Sci and Tech subjects; closest: L6)
const GRADE_TO_LEVEL: Record<number, number> = {
  4: 4,
  5: 5,
  6: 6,
};

/** Normalise the onboarding grade (string "1".."12" or "R") to a number.
 *  "R" maps to 0 so the below-content branch fires. */
export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 4;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 4;
}

/** Topic counts per level (from CAPS). */
const TOPIC_COUNTS: Record<number, number> = {
  4: 18, 5: 17, 6: 20,
};

export function seedForGrade(grade: string | number | null | undefined): NstEntrySeed {
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
    entrySkillId: `NST.L${level}.LL.T01`,   // Term 1, Life & Living, first topic
    beyondContent,
    belowContent,
  };
}

/** Topic IDs in CAPS termly order for a given grade. UI may use this for a
 *  default sort even though all topics are unlocked simultaneously.
 *  Order follows CAPS terms: T1 Life & Living → T2 Matter & Materials →
 *  T3 Energy & Change → T4 Planet Earth & Beyond. */
export function topicsForLevel(level: number): string[] {
  if (level < LOWEST_AVAILABLE_LEVEL || level > HIGHEST_AVAILABLE_LEVEL) return [];

  // Term-by-term counts vary per grade — must match the skill tree exactly.
  const COUNTS_BY_LEVEL: Record<number, Record<"LL" | "MM" | "EC" | "PEB", number>> = {
    4: { LL: 5, MM: 4, EC: 4, PEB: 5 },
    5: { LL: 5, MM: 4, EC: 4, PEB: 4 },
    6: { LL: 5, MM: 6, EC: 4, PEB: 5 },
  };
  const counts = COUNTS_BY_LEVEL[level];
  const ids: string[] = [];
  (["LL", "MM", "EC", "PEB"] as const).forEach((strand) => {
    const n = counts[strand];
    for (let i = 1; i <= n; i++) {
      ids.push(`NST.L${level}.${strand}.T${String(i).padStart(2, "0")}`);
    }
  });
  return ids;
}

/** Total topic count for a level — used for progress UI. */
export function topicCountForLevel(level: number): number {
  return TOPIC_COUNTS[level] ?? 0;
}

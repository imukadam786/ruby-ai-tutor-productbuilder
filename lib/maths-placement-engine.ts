// ─── lib/maths-placement-engine.ts ───────────────────────────────────────────
// Pure placement logic extracted from MathsDiagnosticPlacement.tsx so it can
// be imported and unit-tested independently of any React component.

// ── Gate definitions ─────────────────────────────────────────────────────────

export const SEARCH_GATES: Array<{ name: string; domains: [string, string] }> = [
  { name: "G1",  domains: ["M001", "M002"] },  // Grade 1:  Counting / Number sequences
  { name: "G2",  domains: ["M003", "M020"] },  // Grade 2:  Place value / 2-digit addition
  { name: "G3",  domains: ["M004", "M005"] },  // Grade 3:  Addition / Subtraction strategy
  { name: "G4",  domains: ["M006", "M028"] },  // Grade 4:  Multiplication / Division
  { name: "G5",  domains: ["M008", "M029"] },  // Grade 5:  Fractions intro / Fractions equivalence
  { name: "G6",  domains: ["M030", "M031"] },  // Grade 6:  Fraction operations / Percentages
  { name: "G7",  domains: ["M009", "M010"] },  // Grade 7:  Ratio & proportion / BODMAS
  { name: "G8",  domains: ["M032", "M033"] },  // Grade 8:  Negative numbers / Algebra patterns
  { name: "G9",  domains: ["M011", "M034"] },  // Grade 9:  Algebraic expressions / Advanced linear equations
  { name: "G10", domains: ["M_GEO", "M013"] },  // Grade 10: Geometry & space (L15) / Quadratic factorisation (L18)
  { name: "G11", domains: ["M014", "M015"] },  // Grade 11: Functions & lines / Exponentials & logs
  { name: "G12", domains: ["M016", "M017"] },  // Grade 12: Trigonometry / Calculus
];

// ── Entry level map ───────────────────────────────────────────────────────────

export const GATE_PASSED_ENTRY: Record<number, number> = {
  0: 2,   // Passed Grade 1 → entry Addition Concepts (level 2)
  1: 3,   // Passed Grade 2 → entry Subtraction Concepts (level 3)
  2: 5,   // Passed Grade 3 → entry Multiplication Concepts (level 5)
  3: 8,   // Passed Grade 4 → entry Fractions Introduction (level 8)
  4: 9,   // Passed Grade 5 → entry Fraction Operations (level 9)
  5: 12,  // Passed Grade 6 → entry Negative Numbers and Integers (level 12)
  6: 12,  // Passed Grade 7 → entry Negative Numbers and Integers (level 12)
  7: 13,  // Passed Grade 8 → entry Algebra — Patterns and Variables (level 13)
  8: 15,  // Passed Grade 9 → entry Geometry — Shape and Space (level 15)
  9: 19,  // Passed Grade 10 → entry Functions and Straight Lines (level 19)
  10: 21, // Passed Grade 11 → entry Trigonometric Ratios (level 21)
  11: 22, // Passed Grade 12 → top of tree (level 22)
};

// ── Partial-pass entry map ─────────────────────────────────────────────────────
// Keyed by the index of the highest gate a student FULLY passed. The value is the
// landing level when the *next* gate up was only half-passed (exactly one of its
// two topics correct). This rescues the "in-between" skill-tree levels that the
// gate model otherwise skips: without it, a single slip on the next band drops a
// student two levels (e.g. Grade 3 near-miss: L5 → L3) instead of one (L5 → L4).
//
// Rule applied: land one level above what the student fully proved, so we never
// auto-complete content they have not demonstrated. Boundaries where the two
// gates already sit on neighbouring levels (G1→G2, G4→G5, G6/G7, G7→G8, G11→G12)
// have no in-between level and are intentionally absent.
export const GATE_PARTIAL_ENTRY: Record<number, number> = {
  1: 4,   // Passed Grade 2 + half of Grade 3   → Addition & Subtraction Fluency
  2: 6,   // Passed Grade 3 + half of Grade 4   → Multiplicative Reasoning
  4: 10,  // Passed Grade 5 + half of Grade 6   → Decimals
  7: 14,  // Passed Grade 8 + half of Grade 9   → Linear Equations
  8: 16,  // Passed Grade 9 + half of Grade 10  → Statistics and Data
  9: 20,  // Passed Grade 10 + half of Grade 11 → Exponentials and Logarithms
};

// ── Level labels ─────────────────────────────────────────────────────────────

export const LEVEL_LABEL: Record<number, string> = {
  1:  "Counting & Number Sense",
  2:  "Addition Concepts",
  3:  "Subtraction Concepts",
  4:  "Addition & Subtraction Fluency",
  5:  "Multiplication Concepts",
  6:  "Multiplicative Reasoning",
  7:  "Division Concepts",
  8:  "Fractions — Introduction",
  9:  "Fraction Operations",
  10: "Decimals",
  11: "Ratio and Proportion",
  12: "Negative Numbers and Integers",
  13: "Algebra — Patterns and Variables",
  14: "Linear Equations",
  15: "Geometry — Shape and Space",
  16: "Statistics and Data",
  17: "Advanced Problem Solving",
  18: "Quadratic Algebra",
  19: "Functions and Straight Lines",
  20: "Exponentials and Logarithms",
  21: "Trigonometric Ratios",
  22: "Calculus — Differentiation",
};

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Returns the [lo, hi] gate index window for a given school grade.
 * Grade 1 → [0,0] (1 gate). Grade 2 → [0,1] (2 gates). Grade 3+ → 3-gate window.
 */
export function getSearchWindow(grade: number): [number, number] {
  const hi = Math.min(grade - 1, SEARCH_GATES.length - 1);
  const lo = Math.max(0, hi - 2);
  return [lo, hi];
}

/**
 * Returns all domain IDs that will be tested for a given school grade.
 */
export function getDomainsForGrade(grade: number): string[] {
  const [lo, hi] = getSearchWindow(grade);
  return SEARCH_GATES.slice(lo, hi + 1).flatMap((g) => g.domains);
}

/**
 * Conservative fallback entry level when a student fails every gate in their window.
 */
export function getGradeFloor(grade: number): number {
  if (grade <= 2) return 1;
  if (grade <= 3) return 1;
  if (grade <= 4) return 2;
  if (grade <= 5) return 3;
  if (grade <= 6) return 4;
  if (grade <= 7) return 5;
  if (grade <= 8) return 5;
  if (grade <= 9) return 7;
  if (grade <= 10) return 8;
  if (grade <= 11) return 11;
  if (grade <= 12) return 13;
  return 17;
}

// ── Scoring helpers ────────────────────────────────────────────────────────────

/**
 * Whether a single domain is passed, given how many of its questions were correct.
 * Threshold scales with question count:
 *   2 questions (Grade 3–12): both must be correct — prevents a single lucky
 *     answer passing a domain and cascading into a large overplacement.
 *   3 questions (Grade 2):    majority (≥2/3) — one slip is forgiven.
 *   6 questions (Grade 1):    majority (≥4/6) — consistent performance needed.
 */
export function isDomainPassed(correct: number, total: number): boolean {
  if (total === 0) return false;
  if (total === 2) return correct === 2; // strict: both correct
  return correct / total >= 0.5;         // majority for 3q and 6q
}

/** A gate is passed only when BOTH of its domains are passed. */
export function isGatePassed(
  idx: number,
  domainCorrect: Record<string, number>,
  domainTotal: Record<string, number>,
): boolean {
  const gate = SEARCH_GATES[idx];
  return (
    !!gate &&
    gate.domains.every((d) => isDomainPassed(domainCorrect[d] ?? 0, domainTotal[d] ?? 0))
  );
}

/**
 * Resolve a student's skill-tree entry level from their per-domain results.
 *
 * Order of decisions:
 *   1. No gate passed at all → conservative grade floor.
 *   2. Prerequisite gap (passed a higher band but failed a lower one) → start at
 *      the failed band's content rather than skipping the gap.
 *   3. Partial pass of the band just above the highest fully-passed band (exactly
 *      one of its two topics correct) → the in-between level from GATE_PARTIAL_ENTRY.
 *   4. Otherwise → the full-pass entry level for the highest gate passed.
 */
export function resolveEntryLevel(
  domainCorrect: Record<string, number>,
  domainTotal: Record<string, number>,
  grade: number,
): number {
  const domainTested = (d: string) => (domainTotal[d] ?? 0) > 0;
  const domainPassed = (d: string) =>
    isDomainPassed(domainCorrect[d] ?? 0, domainTotal[d] ?? 0);

  const [lo, hi] = getSearchWindow(grade);
  let highestPassedGate = -1;
  let lowestFailedGate = -1;
  for (let i = lo; i <= hi; i++) {
    if (isGatePassed(i, domainCorrect, domainTotal)) {
      highestPassedGate = i;
    } else {
      const wasTested = SEARCH_GATES[i].domains.some((d) => domainTested(d));
      if (wasTested && lowestFailedGate === -1) lowestFailedGate = i;
    }
  }

  if (highestPassedGate < 0) return getGradeFloor(grade);

  // High overall score skips the gap penalty: a near-perfect quiz is not
  // evidence of a foundational gap — it's noise on a short instrument. With
  // ≥75% correct overall and at least one gate passed, treat any "gap" as a
  // slip and land at the highest gate passed instead of below the failed one.
  const totalCorrect = Object.values(domainCorrect).reduce((a, b) => a + b, 0);
  const totalAsked   = Object.values(domainTotal).reduce((a, b) => a + b, 0);
  const skipGapPenalty = totalAsked > 0 && totalCorrect / totalAsked >= 0.75;

  const hasGap = !skipGapPenalty && lowestFailedGate >= 0 && highestPassedGate > lowestFailedGate;
  if (hasGap) {
    return lowestFailedGate > 0
      ? GATE_PASSED_ENTRY[lowestFailedGate - 1] ?? getGradeFloor(grade)
      : getGradeFloor(grade);
  }

  // No prerequisite gap. If the band just above the highest fully-passed band was
  // half-passed, the student has partial mastery of it — land one level up rather
  // than skipping the in-between level entirely.
  const nextGate = highestPassedGate + 1;
  const partialLevel = GATE_PARTIAL_ENTRY[highestPassedGate];
  if (nextGate <= hi && partialLevel !== undefined) {
    const { domains } = SEARCH_GATES[nextGate];
    const tested = domains.some((d) => domainTested(d));
    const passedCount = domains.filter((d) => domainPassed(d)).length;
    if (tested && passedCount === 1) return partialLevel;
  }

  return GATE_PASSED_ENTRY[highestPassedGate] ?? getGradeFloor(grade);
}

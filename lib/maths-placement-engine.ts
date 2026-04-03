// ─── lib/maths-placement-engine.ts ───────────────────────────────────────────
// Pure placement logic extracted from MathsDiagnosticPlacement.tsx so it can
// be imported and unit-tested independently of any React component.

// ── Gate definitions ─────────────────────────────────────────────────────────

export const SEARCH_GATES: Array<{ name: string; domains: [string, string] }> = [
  { name: "G1",  domains: ["M001", "M002"] },  // Grade 1:  Counting / Number sequences
  { name: "G2",  domains: ["M003", "M020"] },  // Grade 2:  Place value / 2-digit addition
  { name: "G3",  domains: ["M004", "M005"] },  // Grade 3:  Addition / Subtraction strategy
  { name: "G4",  domains: ["M006", "M028"] },  // Grade 4:  Multiplication / Division
  { name: "G5",  domains: ["M007", "M029"] },  // Grade 5:  Decomposition / Fractions intro
  { name: "G6",  domains: ["M008", "M031"] },  // Grade 6:  Fraction operations / Percentages
  { name: "G7",  domains: ["M009", "M010"] },  // Grade 7:  Ratio & proportion / BODMAS
  { name: "G8",  domains: ["M032", "M033"] },  // Grade 8:  Negative numbers / Algebra patterns
  { name: "G9",  domains: ["M011", "M012"] },  // Grade 9:  Algebraic expressions / Linear equations
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
  6: 13,  // Passed Grade 7 → entry Algebra — Patterns and Variables (level 13)
  7: 14,  // Passed Grade 8 → entry Linear Equations (level 14)
  8: 15,  // Passed Grade 9 → entry Geometry — Shape and Space (level 15)
  9: 19,  // Passed Grade 10 → entry Functions and Straight Lines (level 19)
  10: 21, // Passed Grade 11 → entry Trigonometric Ratios (level 21)
  11: 22, // Passed Grade 12 → top of tree (level 22)
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

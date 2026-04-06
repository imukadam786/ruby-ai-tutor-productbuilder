/**
 * Question Selector – picks random unused questions from the question bank.
 *
 * Key rules (from spec):
 * 1. For each domain, pick 1 question randomly.
 * 2. Exclude already-used question refs for this student.
 * 3. Once all questions in the pool are exhausted, reset the pool.
 * 4. The selected ref is logged against the student profile (caller persists this).
 */

import questionBankData from "@/data/question-bank.json";
import { StudentProfile, GraduatedHint } from "@/types/ruby";

export interface BankQuestion {
  ref: string;
  question: string;
  context?: string;
  expected: string;
  input_type: string;
  labels?: string[];
  ruby_prompt: string;
  error_signals: string[];
  /** Difficulty level 1–5 assigned by tag-difficulty script. Used for ability-matched selection. */
  difficulty?: number;
  // Type-specific fields
  display?: string;
  expression?: string;
  fraction?: string;
  function?: string;
  valid_sum?: number;
  expected_tens?: number;
  expected_ones?: number;
  expected_unit?: number;
  expected_count?: number;
  expected_a?: string;
  expected_b?: string;
  groups?: number;
  each?: number;
  total?: number;
  task?: string;
  eq?: string;
  step?: string;
  [key: string]: unknown;
}

export interface DomainInfo {
  title: string;
  gate: string;
  skill_ids: string[];
  pass_threshold: number;
  questions_for_mastery: number;
  authored_pool?: number;
  questions: BankQuestion[];
}

const bank = questionBankData as {
  version: string;
  domains: Record<string, DomainInfo>;
};

// ─── Level → Domain mapping ───────────────────────────────────────────────────
// Coarse fallback: maps skill tree level numbers to question bank domains.
// Only used when a skill has no explicit entry in question-bank.json skill_ids.
// #6b will add skill_ids for all 45 unmapped skills, making this purely a safety net.
const LEVEL_TO_DOMAIN: Record<number, string> = {
  1:  "M001",  // Counting and Early Number Sense
  2:  "M004",  // Addition Concepts
  3:  "M005",  // Subtraction Concepts
  4:  "M004",  // Addition and Subtraction Fluency (T1 only — T2/T3 overridden below)
  5:  "M006",  // Multiplication Concepts
  6:  "M006",  // Multiplicative Reasoning
  7:  "M028",  // Division Concepts
  8:  "M008",  // Fractions — Introduction
  9:  "M008",  // Fraction Operations
  10: "M_DEC", // Decimals
  11: "M009",  // Ratio and Proportion
  12: "M010",  // Negative Numbers and Integers
  13: "M011",  // Algebra — Patterns and Variables
  14: "M012",  // Linear Equations
  15: "M_GEO", // Geometry — Angles, Area and Volume
  16: "M_STAT", // Statistics — Averages, Charts and Probability
  17: "M018",  // Advanced Problem Solving
  18: "M013",  // Quadratic Algebra
  19: "M014",  // Functions and Straight Lines
  20: "M015",  // Exponentials and Logarithms
  21: "M016",  // Trigonometric Ratios
  22: "M017",  // Calculus — Differentiation
};

// ─── Skill-level domain overrides ─────────────────────────────────────────────
// Fixes three cases where the level-fallback gives the wrong subject entirely.
// Applied before both the bank skill_ids check and LEVEL_TO_DOMAIN.
// These will be superseded naturally when #6b adds skill_ids for these skills
// in question-bank.json — at that point the DOMAIN_FOR_SKILL check takes over.
const SKILL_DOMAIN_OVERRIDE: Record<string, string> = {
  // L1.T2.A3 "Compare numbers using < > =" — level fallback gives M001 (dot
  // counting). Correct domain is M002 (Number Recognition and Ordering).
  "L1.T2.A3": "M002",

  // L4.T2.A1 and L4.T3.A1 are now in M023 (skill_ids), which takes priority
  // via DOMAIN_FOR_SKILL — overrides removed.
};

// Build explicit skill_id → domain map from question bank data
export const DOMAIN_FOR_SKILL: Record<string, string> = {};
for (const [domainId, domain] of Object.entries(bank.domains)) {
  for (const skillId of domain.skill_ids) {
    DOMAIN_FOR_SKILL[skillId] = domainId;
  }
}

// ─── Get domain for a skill ───────────────────────────────────────────────────
export function getDomainForSkill(skillId: string): string | null {
  // 1. Skill-level overrides — corrects cases where level fallback is wrong subject
  if (SKILL_DOMAIN_OVERRIDE[skillId]) return SKILL_DOMAIN_OVERRIDE[skillId];

  // 2. Explicit mapping from question bank skill_ids (most skills)
  if (DOMAIN_FOR_SKILL[skillId]) return DOMAIN_FOR_SKILL[skillId];

  // 3. Coarse level-based fallback (acceptable for most unmapped tier 2/3 skills)
  const levelMatch = skillId.match(/^L(\d+)\./);
  if (levelMatch) {
    const level = parseInt(levelMatch[1]);
    return LEVEL_TO_DOMAIN[level] || null;
  }
  return null;
}

export function getDomain(domainId: string): DomainInfo | null {
  return bank.domains[domainId] || null;
}

// ─── Select a difficulty-matched unused question for a domain ─────────────────
/**
 * Selects a question from the pool, preferring questions that match the
 * student's current ability level (derived from BKT p_learned).
 *
 * @param domainId      question bank domain (e.g. "M004")
 * @param usedRefs      refs already shown to this student
 * @param isReteach     if true, prefer easier questions to rebuild confidence
 * @param skillId       specific skill override (e.g. to cap M001 dots)
 * @param abilityLevel  student ability 1–5 from bkt.abilityLevel(p_learned).
 *                      When undefined, falls back to random selection (legacy).
 */
export function selectQuestion(
  domainId: string,
  usedRefs: string[],
  isReteach = false,
  skillId = "",
  abilityLevel?: number
): BankQuestion | null {
  const domain = bank.domains[domainId];
  if (!domain) return null;

  const pool = domain.questions;
  if (pool.length === 0) return null;

  // Filter out already-used refs
  let available = pool.filter((q) => !usedRefs.includes(q.ref));

  // If pool exhausted, reset (give full pool again)
  if (available.length === 0) {
    available = [...pool];
  }

  // M001 skill-level dot cap:
  //   L1.T1.A1 = "Count objects to 10" → only serve ≤ 10 dots
  //   L1.T1.A2 = "Count objects to 20" → full pool (up to 20)
  if (domainId === "M001" && skillId === "L1.T1.A1") {
    const capped = available.filter((q) => parseInt(q.expected, 10) <= 10);
    if (capped.length > 0) available = capped;
  }

  // On reteach, prefer small quantities (≤ 8) to rebuild confidence
  if (domainId === "M001" && isReteach) {
    const small = available.filter((q) => parseInt(q.expected, 10) <= 8);
    if (small.length > 0) available = small;
  }

  // ── Skill-level sub-pool filtering ──────────────────────────────────────────
  // M028: L7.T2.A1 gets clean multiplication-inverse division only;
  //       L7.T3.A1 gets questions that involve a quotient or remainder.
  if (domainId === "M028") {
    if (skillId === "L7.T2.A1") {
      const clean = available.filter(
        (q) => !q.question.toLowerCase().includes("remainder") &&
               !q.question.toLowerCase().includes("quotient")
      );
      if (clean.length > 0) available = clean;
    } else if (skillId === "L7.T3.A1") {
      const rem = available.filter(
        (q) => q.question.toLowerCase().includes("remainder") ||
               q.question.toLowerCase().includes("quotient")
      );
      if (rem.length > 0) available = rem;
    }
  }

  // M029: L8.T2.A1 gets number-line questions;
  //       L8.T3.A1 gets equivalence / simplify / compare questions.
  if (domainId === "M029") {
    if (skillId === "L8.T2.A1") {
      const nl = available.filter(
        (q) => q.question.toLowerCase().includes("number line") ||
               q.question.toLowerCase().includes("arrow")
      );
      if (nl.length > 0) available = nl;
    } else if (skillId === "L8.T3.A1") {
      const eq = available.filter(
        (q) => !q.question.toLowerCase().includes("number line") &&
               !q.question.toLowerCase().includes("arrow")
      );
      if (eq.length > 0) available = eq;
    }
  }

  // M030: each L9 skill draws only from its operation subtype.
  const M030_SKILL_SUBTYPE: Record<string, string> = {
    "L9.T1.A1": "add_same",
    "L9.T1.A2": "add_diff",
    "L9.T2.A1": "mult_whole",
    "L9.T2.A2": "mult_frac",
    "L9.T3.A1": "div_whole",
    "L9.T3.A2": "div_frac",
  };
  if (domainId === "M030" && skillId && M030_SKILL_SUBTYPE[skillId]) {
    const subtype = M030_SKILL_SUBTYPE[skillId];
    const typed = available.filter((q) => (q as BankQuestion & { subtype?: string }).subtype === subtype);
    if (typed.length > 0) available = typed;
  }

  // M025: L5.T2.A2 gets ×2, ×5, ×10 table facts only;
  //       L5.T2.A3 gets the harder tables (×3,×4,×6,×7,×8,×9,×11,×12).
  if (domainId === "M025") {
    const parseM025Factors = (q: BankQuestion): [number, number] | null => {
      const m = q.question.match(/^(\d+)\s*×\s*(\d+)\s*=/);
      return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : null;
    };
    const easyTables = new Set([2, 5, 10]);
    if (skillId === "L5.T2.A2") {
      const f = available.filter((q) => {
        const p = parseM025Factors(q);
        return p && (easyTables.has(p[0]) || easyTables.has(p[1]));
      });
      if (f.length > 0) available = f;
    } else if (skillId === "L5.T2.A3") {
      const f = available.filter((q) => {
        const p = parseM025Factors(q);
        return p && !easyTables.has(p[0]) && !easyTables.has(p[1]);
      });
      if (f.length > 0) available = f;
    }
  }

  // M027: route each L6.T2 skill to its correct digit-size sub-pool.
  //   L6.T2.A1 = 2-digit × 1-digit (e.g. 23 × 4)
  //   L6.T2.A2 = 3-digit × 1-digit (e.g. 215 × 4)
  //   L6.T2.A3 = 2-digit × 2-digit (e.g. 23 × 12)
  if (domainId === "M027") {
    const parseFactors = (q: BankQuestion): [number, number] | null => {
      const m = q.question.match(/^(\d+)\s*×\s*(\d+)\s*=/);
      return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : null;
    };
    if (skillId === "L6.T2.A1") {
      const f = available.filter((q) => {
        const p = parseFactors(q);
        return p && p[0] >= 10 && p[0] <= 99 && p[1] >= 1 && p[1] <= 9;
      });
      if (f.length > 0) available = f;
    } else if (skillId === "L6.T2.A2") {
      const f = available.filter((q) => {
        const p = parseFactors(q);
        return p && p[0] >= 100 && p[0] <= 999 && p[1] >= 1 && p[1] <= 9;
      });
      if (f.length > 0) available = f;
    } else if (skillId === "L6.T2.A3") {
      const f = available.filter((q) => {
        const p = parseFactors(q);
        return p && p[0] >= 10 && p[0] <= 99 && p[1] >= 10 && p[1] <= 99;
      });
      if (f.length > 0) available = f;
    }
  }

  // M023: L4.T1.A2 (splitting for addition) gets addition questions only;
  //       L4.T2.A1 (compensation for subtraction) gets subtraction questions only;
  //       L4.T3.A1 (three-digit, both ops) gets the full pool.
  if (domainId === "M023") {
    if (skillId === "L4.T1.A2") {
      const addQ = available.filter((q) => q.question.includes("+"));
      if (addQ.length > 0) available = addQ;
    } else if (skillId === "L4.T2.A1") {
      const subQ = available.filter(
        (q) => q.question.includes("−") || q.question.includes(" - ")
      );
      if (subQ.length > 0) available = subQ;
    }
  }

  // M026: L5.T3.A1 (commutative property) gets only "a×b = b×a" style questions;
  //       L6.T3.A1 (distributive property) gets only expansion/factoring questions.
  if (domainId === "M026") {
    if (skillId === "L5.T3.A1") {
      const commutative = available.filter(
        (q) =>
          !q.question.toLowerCase().includes("distributive") &&
          !q.question.toLowerCase().includes("expand") &&
          !q.question.toLowerCase().includes("split") &&
          !q.question.includes("(")
      );
      if (commutative.length > 0) available = commutative;
    } else if (skillId === "L6.T3.A1") {
      const distributive = available.filter(
        (q) =>
          q.question.toLowerCase().includes("distributive") ||
          q.question.toLowerCase().includes("expand") ||
          q.question.toLowerCase().includes("split") ||
          q.question.includes("(")
      );
      if (distributive.length > 0) available = distributive;
    }
  }

  // ── Difficulty-matched selection ────────────────────────────────────────────
  // When abilityLevel is provided and questions have difficulty tags, prefer
  // questions in the student's ZPD: ability or ability+1 (slightly challenging).
  if (abilityLevel !== undefined) {
    const target = isReteach
      ? Math.max(1, abilityLevel - 1)   // reteach: one step easier
      : abilityLevel;                   // normal: match current ability

    // Try exact match first, then widen ±1
    const exact = available.filter(
      (q) => q.difficulty !== undefined && q.difficulty === target
    );
    if (exact.length > 0) {
      return exact[Math.floor(Math.random() * exact.length)];
    }

    const near = available.filter(
      (q) =>
        q.difficulty !== undefined &&
        Math.abs(q.difficulty - target) <= 1
    );
    if (near.length > 0) {
      return near[Math.floor(Math.random() * near.length)];
    }
    // Fall through to random if no tagged questions found
  }

  // Pick random question (fallback / legacy path)
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

// ─── Mark question as used in student profile ─────────────────────────────────
export function markQuestionUsed(
  profile: StudentProfile,
  domainId: string,
  questionRef: string
): StudentProfile {
  const existing = profile.used_questions?.[domainId] || [];
  return {
    ...profile,
    used_questions: {
      ...(profile.used_questions || {}),
      [domainId]: [...existing, questionRef],
    },
  };
}

// ─── Get used refs for a domain ───────────────────────────────────────────────
export function getUsedRefs(profile: StudentProfile, domainId: string): string[] {
  return profile.used_questions?.[domainId] || [];
}

// ─── Build a GeneratedQuestion from a BankQuestion ───────────────────────────
export function bankQuestionToGenerated(
  q: BankQuestion,
  skillId: string,
  domainId: string,
  includeHint: boolean
): {
  id: string;
  skill_id: string;
  domain_id: string;
  question_ref: string;
  template: "concrete" | "story" | "symbolic";
  question: string;
  hint?: string;
  hints: GraduatedHint;
  expected_answer: string;
  scaffolding_notes: string;
  difficulty?: number;
  labels?: string[];
  bank_question: BankQuestion;
} {
  // Determine template from input_type
  let template: "concrete" | "story" | "symbolic" = "symbolic";
  if (q.input_type === "numeric" && q.context?.includes("dots")) template = "concrete";
  else if (q.input_type === "numeric" && q.context?.includes("Dot")) template = "concrete";
  else if (q.context?.includes("story") || q.question?.toLowerCase().includes("there are")) template = "story";

  // Build graduated hints (always available; shown progressively in UI)
  const hints = buildGraduatedHints(q, domainId);
  // Legacy flat hint — keep for backward compat with forceHint path
  const hint = includeHint ? hints.worked : undefined;

  return {
    id: `q_${domainId}_${q.ref}_${Date.now()}`,
    skill_id: skillId,
    domain_id: domainId,
    question_ref: q.ref,
    template,
    question: buildQuestionText(q, domainId),
    hint,
    hints,
    expected_answer: q.expected,
    scaffolding_notes: `Error signals: ${q.error_signals.join(", ")}`,
    difficulty: q.difficulty,
    labels: q.labels,
    bank_question: q,
  };
}

function buildDotDisplay(context: string): string {
  const m = context.match(/(\d+)\s*dots/i);
  if (!m) return context;
  const count = parseInt(m[1], 10);
  const rows: string[] = [];
  for (let i = 0; i < count; i += 5) {
    rows.push(Array.from({ length: Math.min(5, count - i) }, () => "●").join("  "));
  }
  return rows.join("\n");
}

function buildQuestionText(q: BankQuestion, domainId: string): string {
  switch (domainId) {
    case "M001":
      return `${buildDotDisplay(q.context ?? "")}\n\n${q.ruby_prompt}`;
    case "M002":
      return `Sequence: ${q.context}\n\n${q.ruby_prompt}`;
    case "M003":
      return `Number: ${q.display}\n\n${q.ruby_prompt}\n(Enter tens and ones separately)`;
    case "M004":
    case "M005":
      return `${q.expression} = ?\n\n${q.ruby_prompt}`;
    case "M006":
      return `${q.question}\n\nEnter: (1) number of groups, (2) number in each group, (3) total.`;
    case "M007":
      return `${q.ruby_prompt}\n\nNumber: ${q.display}\n\nExample: ${q.expected_a} AND ${q.expected_b} (any valid decomposition accepted)`;
    case "M008":
      return `Fraction: ${q.fraction}\n\n${q.ruby_prompt}`;
    case "M_SCALE":
    case "M_DIV_SHARE":
    case "M_DEC":
    case "M009":
    case "M010":
    case "M011":
    case "M012":
    case "M013":
    case "M014":
    case "M015":
    case "M016":
    case "M017":
    case "M018":
    case "M_GEO":
    case "M_STAT":
      return q.question;
    default:
      return q.question;
  }
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}

function buildGraduatedHints(q: BankQuestion, domainId: string): GraduatedHint {
  // ── M029: 4 distinct sub-types share one domain — detect from error_signals ──
  if (domainId === "M029") {
    const sig = q.error_signals ?? [];

    // Number line questions
    if (sig.some(s => s === "ERR_NUM_LINE" || s === "ERR_NUMBER_LINE")) {
      // Extract parts/position from question text e.g. "split into 6 equal parts. The arrow is at the 4th mark"
      const partsMatch  = q.question.match(/(\d+)\s*equal parts/i);
      const markMatch   = q.question.match(/(?:at the |at\s|points to the )(\d+)(?:st|nd|rd|th)?\s*mark/i);
      const parts  = partsMatch  ? partsMatch[1]  : "4";
      const mark   = markMatch   ? markMatch[1]   : "3";
      return {
        nudge:   "Count how many equal parts the line is divided into — that's your denominator.",
        process: "The number of parts = denominator (bottom). The position of the arrow = numerator (top).",
        worked:  `Line split into ${parts} equal parts, arrow at the ${mark}${ordinal(Number(mark))} mark → fraction is ${mark}/${parts}.`,
      };
    }

    // Compare / order fractions
    if (sig.some(s => s === "ERR_FRAC_ORDER")) {
      // Extract the two fractions from question text e.g. "Which is larger: 5/6 or 7/8?"
      const fracMatch = q.question.match(/(\d+\/\d+)\D+(\d+\/\d+)/);
      const [f1, f2] = fracMatch ? [fracMatch[1], fracMatch[2]] : ["5/6", "7/8"];
      const [n1, d1] = f1.split("/").map(Number);
      const [n2, d2] = f2.split("/").map(Number);
      const lcd = d1 * d2;
      return {
        nudge:   "You can't compare fractions directly unless they have the same denominator.",
        process: "Find a common denominator, then convert both fractions and compare the numerators.",
        worked:  `Compare ${f1} and ${f2}: common denominator is ${lcd}. ${f1} = ${n1 * d2}/${lcd}, ${f2} = ${n2 * d1}/${lcd}. Compare ${n1 * d2} and ${n2 * d1}.`,
      };
    }

    // Simplify fractions
    if (sig.some(s => s === "ERR_SIMPLIFY" || s === "ERR_SIMPLIFY_FRAC" || s === "ERR_HCF")) {
      const fracMatch = q.question.match(/(\d+\/\d+)/);
      const frac = fracMatch ? fracMatch[1] : "6/9";
      return {
        nudge:   "Look for a number that divides evenly into both the top and bottom.",
        process: "Find the highest common factor (HCF) of the numerator and denominator. Divide both by it.",
        worked:  `To simplify ${frac}: find the HCF of both numbers. Divide the top and bottom by that HCF. Keep dividing until no common factor remains.`,
      };
    }

    // Equivalent fractions (default M029 sub-type)
    if (sig.some(s => s === "ERR_EQUIV_FRAC" || s === "ERR_MULTIPLY_BOTH" || s === "ERR_EQUIV_MULT" || s === "ERR_DENOM_ADD")) {
      const fracMatch = q.question.match(/(\d+\/\d+)/);
      const frac = fracMatch ? fracMatch[1] : "1/2";
      const [, den] = frac.split("/").map(Number);
      const targetMatch = q.question.match(/denominator of (\d+)/i) || q.question.match(/=\s*___\/(\d+)/);
      const targetDen = targetMatch ? Number(targetMatch[1]) : den * 2;
      const factor = targetDen / den;
      return {
        nudge:   "Whatever you do to the bottom of a fraction, you must do the same to the top.",
        process: `Find what you multiply ${den} by to reach ${targetDen}. Then multiply the numerator by the same number.`,
        worked:  `${frac}: bottom ${den} × ${factor} = ${targetDen}. So top must also × ${factor}.`,
      };
    }
  }

  const map: Record<string, GraduatedHint> = {
    M001: {
      nudge:   "Think about how many objects you can see.",
      process: "Count each dot one at a time — point to each one as you go.",
      worked:  "Start at 1 and count every dot: 1, 2, 3… until you've touched them all.",
    },
    M002: {
      nudge:   "Look at the numbers — is there a pattern?",
      process: "Is the sequence going up or down? Work out by how much each time.",
      worked:  "Find the difference between the first two numbers. Check if that same difference applies to the next pair — then continue the pattern.",
    },
    M003: {
      nudge:   "Think about tens and ones.",
      process: "The tens digit tells you how many groups of 10. The ones digit tells you the leftovers.",
      worked:  "For a number like 47: the tens digit is 4 (so 4 groups of 10 = 40), and the ones digit is 7. Answer: 4 tens and 7 ones.",
    },
    M004: {
      nudge:   "Think about what addition means — combining two amounts.",
      process: "Start from the larger number and count on by the smaller one.",
      worked:  "For 7 + 5: start at 7, then count on 5 more — 8, 9, 10, 11, 12.",
    },
    M005: {
      nudge:   "Think about what subtraction means — taking away or finding the gap.",
      process: "Count up from the smaller number to the larger. The number of steps is the answer.",
      worked:  "For 12 − 7: start at 7 and count up to 12 — that's 5 steps, so the answer is 5.",
    },
    M006: {
      nudge:   "Think about equal groups.",
      process: "Multiplication means groups × items in each group = total.",
      worked:  "Count one group first, then add that amount repeatedly — or multiply: groups × size of each group.",
    },
    M007: {
      nudge:   "There's more than one way to split this number.",
      process: "Break the number into hundreds, tens, and ones — or any combination that adds up correctly.",
      worked:  "For 345: you could write 300 + 40 + 5, or 300 + 45, or 200 + 145. Any valid split is correct.",
    },
    M008: {
      nudge:   "Look at the bottom number of the fraction.",
      process: "The denominator (bottom) tells you how many equal parts the whole is split into.",
      worked:  "For ¾: the whole is split into 4 equal parts. You are counting 3 of those parts.",
    },
    M009: {
      nudge:   "How does one side relate to the other?",
      process: "Find the scale factor: what do you multiply one side by to get the other?",
      worked:  "If one side is 4 and the other is 12, the scale factor is 3 (4 × 3 = 12). Apply that same factor to find the missing value.",
    },
    M_DEC: {
      nudge:   "Where are the decimal points?",
      process: "Line up the decimal points before adding or subtracting. For ×10, 100 or 1000 — move digits left.",
      worked:  "For 3.4 + 1.25: write them so the decimal points align, then add column by column — 3.40 + 1.25 = 4.65.",
    },
    M010: {
      nudge:   "The order you do operations matters.",
      process: "Follow BODMAS: Brackets first, then Orders, then Division/Multiplication, then Addition/Subtraction.",
      worked:  "For 3 + 2 × 4: do the multiplication first (2 × 4 = 8), then add 3. Answer: 11, not 20.",
    },
    M011: {
      nudge:   "Group like terms together.",
      process: "Collect all the x terms on one side and all the number terms on the other.",
      worked:  "For 3x + 5 + x − 2: group x terms (3x + x = 4x) and numbers (5 − 2 = 3). Simplified: 4x + 3.",
    },
    M012: {
      nudge:   "Use inverse operations — undo what was done to x.",
      process: "Subtract the constant from both sides first, then divide both sides by the coefficient of x.",
      worked:  "For 2x + 3 = 11: subtract 3 from both sides → 2x = 8, then divide by 2 → x = 4.",
    },
    M013: {
      nudge:   "Think about what two numbers multiply to give the last term.",
      process: "Find two numbers that multiply to give c and add to give b.",
      worked:  "For x² + 5x + 6: find two numbers that multiply to 6 and add to 5. That's 2 and 3. So: (x + 2)(x + 3).",
    },
    M014: {
      nudge:   "Think about where the line crosses the axes.",
      process: "y-intercept: set x = 0. x-intercept: set y = 0. Gradient = coefficient of x.",
      worked:  "For y = 2x + 3: gradient = 2, y-intercept = 3 (set x=0: y=3), x-intercept = −1.5 (set y=0: x = −3/2).",
    },
    M015: {
      nudge:   "Think about the relationship between logs and powers.",
      process: "log_b(x) = n means b^n = x. Switch between log and exponential form.",
      worked:  "log₂(8) = 3 because 2³ = 8. Use this switching to solve: if log₃(x) = 4, then x = 3⁴ = 81.",
    },
    M016: {
      nudge:   "Label the sides of the triangle first.",
      process: "SOH CAH TOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent.",
      worked:  "Label the hypotenuse, the side opposite the angle, and the adjacent side. Choose the ratio that uses two of those three. Rearrange to find the unknown.",
    },
    M017: {
      nudge:   "Think about the power of x and its coefficient.",
      process: "Power rule: if f(x) = axⁿ, then f′(x) = n·axⁿ⁻¹. Differentiate each term separately.",
      worked:  "For f(x) = 3x² + 2x: differentiate each term — 3x² → 6x, 2x → 2. So f′(x) = 6x + 2.",
    },
    M018: {
      nudge:   "Break the problem into smaller parts.",
      process: "Identify what you know and what you need to find. Write it down before calculating.",
      worked:  "List the given values. Write the formula. Substitute the known values. Solve for the unknown step by step.",
    },
    M_GEO: {
      nudge:   "Think about the shape and what measurements you need.",
      process: "Area of rectangle = l×w. Area of triangle = ½bh. Angles in a triangle add to 180°.",
      worked:  "Identify the shape. Write the formula. Substitute the measurements. Calculate step by step.",
    },
    M_STAT: {
      nudge:   "Think about what each average or probability measure means.",
      process: "Mean = total ÷ count. Median = middle value (ordered). Mode = most frequent. Probability = favourable ÷ total.",
      worked:  "For mean of 3, 7, 5, 9: add them (3+7+5+9=24), then divide by 4. Mean = 6.",
    },
    M019: {
      nudge:   "Do you know any doubles near this number?",
      process: "Use doubles (6+6=12), near-doubles (6+7=13), or make-ten (8+5: 8+2=10, +3=13).",
      worked:  "For 7 + 8: 7 + 7 = 14 (double), then add 1 more → 15.",
    },
    M020: {
      nudge:   "Start with the ones column.",
      process: "Add ones first. If the ones total 10 or more, write the units digit and carry 1 ten.",
      worked:  "For 47 + 35: ones: 7+5=12, write 2 carry 1. Tens: 4+3+1(carry)=8. Answer: 82.",
    },
    M021: {
      nudge:   "Think about the gap between the two numbers.",
      process: "Count up from the smaller number to the larger — the number of steps is the difference.",
      worked:  "For 52 − 37: count up from 37 → 40 (3 steps) → 52 (12 steps). Total: 3 + 12 = 15.",
    },
    M022: {
      nudge:   "Start with the ones column.",
      process: "Subtract ones first. If the top digit is smaller, borrow 1 ten from the tens column.",
      worked:  "For 63 − 28: ones: can't do 3−8, so borrow — 13−8=5. Tens: 5−2=3 (after borrowing). Answer: 35.",
    },
    M023: {
      nudge:   "Is there a friendly number nearby you could use?",
      process: "Splitting: break into tens and ones and add separately. Compensation: round, calculate, adjust.",
      worked:  "For 46 + 38 by splitting: 40+30=70, 6+8=14, total=84. By compensation: 46+40=86, −2=84.",
    },
    M024: {
      nudge:   "Look at the difference between consecutive terms.",
      process: "Find the common difference and add (or subtract) it each time.",
      worked:  "For 3, 6, 9, ?: the difference is 3 each time. Next term: 9 + 3 = 12.",
    },
    M025: {
      nudge:   "Do you know a related fact you could use?",
      process: "×2 = doubles, ×5 = count by 5s, ×10 = add a zero. Use known facts to derive unknown ones.",
      worked:  "For 7×6: if you know 7×5=35, just add one more 7 → 35+7=42.",
    },
    M026: {
      nudge:   "Try splitting one of the numbers to make it easier.",
      process: "Distributive law: a×(b+c) = a×b + a×c. Split the second number into tens and ones.",
      worked:  "For 7×14: split 14 into 10+4. Then 7×10=70 and 7×4=28. Total: 70+28=98.",
    },
    M027: {
      nudge:   "Start from the right-hand column.",
      process: "Multiply each digit from right to left, carrying any tens into the next column.",
      worked:  "For 34×6: ones: 4×6=24, write 4 carry 2. Tens: 3×6=18, +2=20. Answer: 204.",
    },
    M028: {
      nudge:   "Think about multiplication — division is the inverse.",
      process: "Ask: how many times does the divisor go into the number? For remainders, find the nearest multiple.",
      worked:  "For 29 ÷ 4: 4×7=28 (nearest multiple), 29−28=1. Answer: 7 remainder 1.",
    },
    // M029 sub-types handled below via early return
    M029: {
      nudge:   "Look at how the fraction is drawn or written.",
      process: "For equivalent fractions: multiply or divide both top and bottom by the same number.",
      worked:  "For ½ = ?/8: multiply top and bottom by 4 → 4/8. Check: 4÷8 = 0.5 = ½. ✓",
    },
    M030: {
      nudge:   "Check whether the denominators are the same.",
      process: "Adding: find a common denominator first. Multiplying: top×top, bottom×bottom. Dividing: flip the second fraction and multiply.",
      worked:  "For ½ + ⅓: common denominator is 6. ½=3/6, ⅓=2/6. Sum: 5/6.",
    },
    M031: {
      nudge:   "Do you know a simple percentage you could start from?",
      process: "10% = ÷10. 25% = ÷4. 50% = ÷2. Build up from a simple percentage.",
      worked:  "For 35% of 80: 10% of 80=8. 30%=24. 5%=4. 35%=24+4=28.",
    },
    M032: {
      nudge:   "Think carefully about the signs.",
      process: "Adding a negative = subtracting. Subtracting a negative = adding. Negative × negative = positive.",
      worked:  "For −3 + (−5): adding a negative, so −3 − 5 = −8. For −4 × −2: negative × negative = positive → 8.",
    },
    M033: {
      nudge:   "What operation was applied to get from one term to the next?",
      process: "For sequences: find the common difference. For brackets: multiply each term inside by the factor outside.",
      worked:  "For 3(x + 4): multiply 3 by x → 3x, and 3 by 4 → 12. Expanded: 3x + 12.",
    },
    M034: {
      nudge:   "What is the unknown and what do you know?",
      process: "Move all x terms to one side and all number terms to the other. Use inverse operations.",
      worked:  "For 3x − 4 = 11: add 4 to both sides → 3x = 15. Divide by 3 → x = 5.",
    },
    M_SCALE: {
      nudge:   "How does the new amount compare to the original?",
      process: "Find the scale factor — how many times larger or smaller is the new amount?",
      worked:  "If a recipe for 4 needs 200g of flour, for 10 people: scale factor = 10÷4 = 2.5. Flour = 200×2.5 = 500g.",
    },
    M_DIV_SHARE: {
      nudge:   "Are you sharing equally or grouping?",
      process: "Sharing: divide total equally into groups. Grouping: count how many groups of that size fit into the total.",
      worked:  "Sharing 24 sweets among 6 children: 24÷6=4 each. Grouping 24 into groups of 6: 24÷6=4 groups.",
    },
  };

  return map[domainId] ?? {
    nudge:   "Read the question carefully — what is it asking you to find?",
    process: "Break the problem into smaller steps. Write down what you know first.",
    worked:  "Identify the key numbers and the operation needed. Work through one step at a time.",
  };
}

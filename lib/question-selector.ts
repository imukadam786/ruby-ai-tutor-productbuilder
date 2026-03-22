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
import { StudentProfile } from "@/types/ruby";

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
  7:  "M007",  // Division Concepts
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

  // L4.T2.A1 "Compensation strategy for subtraction" — level fallback gives
  // M004 (Addition). This is a subtraction skill; M005 is correct.
  "L4.T2.A1": "M005",

  // L4.T3.A1 "Add and subtract three-digit numbers" — level fallback gives
  // M004 (Addition only). Student has had extensive addition practice via L2
  // and L4.T1; serving M005 (Subtraction) here balances the mixed operation.
  "L4.T3.A1": "M005",
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
  expected_answer: string;
  scaffolding_notes: string;
  difficulty?: number;
  bank_question: BankQuestion;
} {
  // Determine template from input_type
  let template: "concrete" | "story" | "symbolic" = "symbolic";
  if (q.input_type === "numeric" && q.context?.includes("dots")) template = "concrete";
  else if (q.input_type === "numeric" && q.context?.includes("Dot")) template = "concrete";
  else if (q.context?.includes("story") || q.question?.toLowerCase().includes("there are")) template = "story";

  // Build hint if requested
  let hint: string | undefined;
  if (includeHint) {
    hint = buildHint(q, domainId);
  }

  return {
    id: `q_${domainId}_${q.ref}_${Date.now()}`,
    skill_id: skillId,
    domain_id: domainId,
    question_ref: q.ref,
    template,
    question: buildQuestionText(q, domainId),
    hint,
    expected_answer: q.expected,
    scaffolding_notes: `Error signals: ${q.error_signals.join(", ")}`,
    difficulty: q.difficulty,
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

function buildHint(_q: BankQuestion, domainId: string): string {
  const hints: Record<string, string> = {
    M001: "Count each dot one at a time, touching or pointing to each one.",
    M002: "Look at the pattern — is the sequence going up or down? By how much each time?",
    M003: "The tens digit tells you how many groups of 10. The ones digit tells you the leftovers.",
    M004: "Try counting on from the larger number, or think of a number bond.",
    M005: "Think: what number do you add to the smaller number to get the larger one?",
    M006: "Groups × items in each group = total. Count one group first.",
    M007: "You can split hundreds, tens, and ones in many ways. E.g. 345 = 300+40+5 or 300+45.",
    M008: "The denominator (bottom number) tells you how many equal parts the whole is divided into.",
    M009: "Find the scale factor first: what number do you multiply one side by to get the other?",
    M_DEC: "Line up the decimal points before adding or subtracting. When multiplying by 10, 100 or 1000, move each digit that many places to the left.",
    M010: "Remember BODMAS: Brackets, Orders, Division, Multiplication, Addition, Subtraction.",
    M011: "Collect the x terms together, then collect the number terms together.",
    M012: "Inverse operations: subtract the constant from both sides first, then divide.",
    M013: "Find two numbers that multiply to give c and add to give b.",
    M014: "y-intercept: set x=0. x-intercept: set y=0. Gradient: the coefficient of x.",
    M015: "log_b(x) = n means b^n = x. Switch between log and exponential form.",
    M016: "SOH CAH TOA: Sin=Opposite/Hypotenuse, Cos=Adjacent/Hypotenuse, Tan=Opposite/Adjacent.",
    M017: "Power rule: if f(x) = ax^n, then f'(x) = n·ax^(n-1). Differentiate each term.",
    M018: "Break the problem into steps. Identify what you know and what you need to find.",
    M_GEO: "Angles: acute < 90, right = 90, obtuse 90–180, reflex > 180. Area: rectangle = l×w, triangle = ½bh. Volume = l×w×h.",
    M_STAT: "Mean = total ÷ count. Median = middle value when ordered. Mode = most frequent. Probability = favourable ÷ total.",
  };
  return hints[domainId] || "Read the question carefully and break it into smaller steps.";
}

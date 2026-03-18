/**
 * Bayesian Knowledge Tracing (BKT)
 *
 * Replaces the hard threshold mastery model (3 correct at 80%) with a
 * continuous probability estimate P(learned) that updates after every attempt.
 *
 * Standard BKT parameters:
 *   p_init    — P(L₀)  prior probability student already knows the skill
 *   p_transit — P(T)   probability of learning from a single attempt
 *   p_slip    — P(S)   probability of wrong answer despite knowing (slip)
 *   p_guess   — P(G)   probability of right answer despite not knowing (guess)
 */

export interface BKTParams {
  p_init: number;     // P(L₀) starting probability of knowing
  p_transit: number;  // P(T)  learning rate per attempt
  p_slip: number;     // P(S)  slip rate
  p_guess: number;    // P(G)  guess rate
}

/** Default parameters calibrated for structured school-age learning. */
export const DEFAULT_BKT_PARAMS: BKTParams = {
  p_init: 0.10,
  p_transit: 0.15,
  p_slip: 0.08,
  p_guess: 0.20,
};

/**
 * Skill difficulty affects P(G) and P(S):
 * harder skills have lower guess rates and higher slip rates.
 */
export const DIFFICULTY_PARAMS: Record<number, Partial<BKTParams>> = {
  1: { p_slip: 0.05, p_guess: 0.25 }, // easy — rare slips, easy to guess
  2: { p_slip: 0.07, p_guess: 0.22 },
  3: { p_slip: 0.08, p_guess: 0.20 }, // default
  4: { p_slip: 0.10, p_guess: 0.15 },
  5: { p_slip: 0.12, p_guess: 0.10 }, // hard — more slips, harder to guess
};

/** P(L) >= MASTERY_THRESHOLD means skill is mastered. */
export const MASTERY_THRESHOLD = 0.95;

/** Initialise p_learned for a new skill. */
export function initBKT(params: BKTParams = DEFAULT_BKT_PARAMS): number {
  return params.p_init;
}

/**
 * Update p_learned after one student response using standard BKT.
 *
 * @param p_learned  current P(L) before this attempt
 * @param is_correct whether the student answered correctly
 * @param params     BKT parameters (default if not provided)
 * @returns          updated P(L) clamped to [0, 1]
 */
export function updateBKT(
  p_learned: number,
  is_correct: boolean,
  params: BKTParams = DEFAULT_BKT_PARAMS
): number {
  const { p_transit, p_slip, p_guess } = params;

  let p_l_given_evidence: number;

  if (is_correct) {
    // P(L | correct) = P(L) * (1 - P(S)) / [P(L)*(1-P(S)) + (1-P(L))*P(G)]
    const numerator = p_learned * (1 - p_slip);
    const denominator = numerator + (1 - p_learned) * p_guess;
    p_l_given_evidence = denominator > 0 ? numerator / denominator : p_learned;
  } else {
    // P(L | wrong) = P(L) * P(S) / [P(L)*P(S) + (1-P(L))*(1-P(G))]
    const numerator = p_learned * p_slip;
    const denominator = numerator + (1 - p_learned) * (1 - p_guess);
    p_l_given_evidence = denominator > 0 ? numerator / denominator : p_learned;
  }

  // Apply learning transition: P(L_new) = P(L|evidence) + (1 - P(L|evidence)) * P(T)
  const p_new = p_l_given_evidence + (1 - p_l_given_evidence) * p_transit;

  return Math.min(1, Math.max(0, p_new));
}

/** Returns true when the student has reached mastery threshold. */
export function isMastered(p_learned: number): boolean {
  return p_learned >= MASTERY_THRESHOLD;
}

/**
 * Merge difficulty-specific parameter overrides with the default params.
 * Call this when selecting BKT params for a question of known difficulty.
 */
export function paramsForDifficulty(difficulty: number): BKTParams {
  const overrides = DIFFICULTY_PARAMS[difficulty] ?? {};
  return { ...DEFAULT_BKT_PARAMS, ...overrides };
}

/**
 * Map p_learned (0–1) to an ability level (1–5) for difficulty-matched
 * question selection. A student with p_learned = 0.65 is at ability level 3
 * and benefits most from difficulty-3 questions.
 */
export function abilityLevel(p_learned: number): number {
  if (p_learned < 0.25) return 1;
  if (p_learned < 0.45) return 2;
  if (p_learned < 0.65) return 3;
  if (p_learned < 0.85) return 4;
  return 5;
}

/**
 * Apply transfer credit from a mastered prerequisite skill.
 * When a student masters skill A which transfers to skill B,
 * B's p_learned is boosted by (transfer_weight × p_learned_A).
 *
 * @param current_p  target skill's current p_learned
 * @param source_p   source skill's p_learned (should be near 0.95)
 * @param weight     transfer weight from knowledge graph (0–1)
 * @returns          updated p_learned for target skill
 */
export function applyTransfer(
  current_p: number,
  source_p: number,
  weight: number
): number {
  const transferred = source_p * weight;
  return Math.max(current_p, transferred);
}

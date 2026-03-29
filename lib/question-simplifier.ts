/**
 * Question Simplifier
 *
 * Replaces academic maths vocabulary with plain-English equivalents
 * when a student's reading level is below the threshold.
 *
 * Threshold: reading current_level < 4
 *   Level 1 → Grade R-1  (Foundation)
 *   Level 2 → ~Grade 2
 *   Level 3 → ~Grade 3-4
 *   Level 4 → ~Grade 5-6  ← no simplification needed from here up
 *   Level 5 → Grade 7+
 *
 * Usage:
 *   import { simplifyQuestion } from "@/lib/question-simplifier";
 *   const plain = simplifyQuestion(questionText, readingLevel);
 */

// ─── Vocabulary map ────────────────────────────────────────────────────────────
// Ordered longest-first so phrases are matched before their component words.
// Each entry: [regex pattern (case-insensitive), replacement]
const VOCAB_MAP: [RegExp, string][] = [
  // Multi-word phrases first
  [/\bhence or otherwise\b/gi,     "use any method to find"],
  [/\bhence\b/gi,                  "use your answer above to"],
  [/\bprove that\b/gi,             "show that"],
  [/\bdeduce that\b/gi,            "use this to show that"],
  [/\bdeduce\b/gi,                 "work out"],
  [/\bgiven that\b/gi,             "if"],
  [/\bshow that\b/gi,              "show that"],          // keep — already plain
  [/\bstate the value\b/gi,        "write the value"],
  [/\bstate\b/gi,                  "write down"],
  [/\bexpress\b/gi,                "write"],
  [/\bdetermine\b/gi,              "find"],
  [/\bcalculate\b/gi,              "work out"],
  [/\bevaluate\b/gi,               "work out"],
  [/\bsimplify\b/gi,               "write in its simplest form"],
  [/\bfactorise\b/gi,              "break into two brackets"],
  [/\bfactorize\b/gi,              "break into two brackets"],
  [/\bexpand\b/gi,                 "multiply out the brackets"],
  [/\bsolve\b/gi,                  "find the value of the letter in"],
  [/\bdifferentiate\b/gi,          "find the derivative of"],
  [/\bintegrate\b/gi,              "find the integral of"],
  [/\bsubstitut(e|ing)\b/gi,       "put the number into"],
  [/\bsubject of the formula\b/gi, "the letter on its own"],
  [/\bmake .+ the subject\b/gi,    "rearrange to get the letter on its own"],
  [/\bcoefficient\b/gi,            "number in front of"],
  [/\bconstant\b/gi,               "fixed number"],
  [/\bdenominator\b/gi,            "bottom number"],
  [/\bnumerator\b/gi,              "top number"],
  [/\bsequence\b/gi,               "number pattern"],
  [/\bterm\b/gi,                   "number in the pattern"],
  [/\bplot\b/gi,                   "draw the point"],
  [/\bsketch\b/gi,                 "draw a rough graph of"],
  [/\bdomain\b/gi,                 "allowed x-values"],
  [/\brange\b/gi,                  "possible y-values"],
  [/\basymptote\b/gi,              "line the graph gets close to but never touches"],
  [/\bintercept\b/gi,              "where the line crosses the axis"],
  [/\bgradient\b/gi,               "steepness of the line"],
  [/\bproportional\b/gi,           "grows at the same rate"],
];

/**
 * Returns true if the student's reading level is low enough
 * that vocabulary simplification should be applied.
 */
export function needsSimplification(readingLevel: number): boolean {
  return readingLevel < 4;
}

/**
 * Applies plain-English vocabulary replacements to a question string.
 * Only makes replacements when readingLevel < 4.
 */
export function simplifyText(text: string, readingLevel: number): string {
  if (!needsSimplification(readingLevel)) return text;
  let result = text;
  for (const [pattern, replacement] of VOCAB_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Simplifies all text fields of a generated question object in-place.
 * Returns a new object — does not mutate.
 */
export function simplifyQuestion<T extends { question: string; hint?: string }>(
  q: T,
  readingLevel: number
): T {
  if (!needsSimplification(readingLevel)) return q;
  return {
    ...q,
    question: simplifyText(q.question, readingLevel),
    hint: q.hint ? simplifyText(q.hint, readingLevel) : q.hint,
  };
}

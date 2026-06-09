// ─── Worked-steps reuse layer (Path A) ───────────────────────────────────────
//
// Every generated question already carries graduated-hint text — a "what to do"
// pointer (hints.process) and a "first step worked" line (hints.worked) — plus
// scaffolding_notes. During the question these are revealed tap-by-tap as hints.
// AFTER a wrong answer we can reuse that same authored text to assemble a short
// worked walkthrough, ending on the actual answer, and feed it to the feedback
// card's "How to fix it" slot.
//
// This is FREE: the text already exists on the question, so there is no AI call
// at answer time. It is the cheap first layer of the "worked re-teach" — it does
// not compute new steps from the numbers (that is the per-generator Path B); it
// re-surfaces what's already authored.

interface WorkedStepsSource {
  /**
   * A deterministic numbers-in walkthrough computed from the question's operands
   * (Path B). When present it is authoritative — it uses the actual numbers, so
   * it beats the reused hint text below.
   */
  working_steps?: string[] | null;
  hints?: { process?: string; worked?: string } | null;
  scaffolding_notes?: string | null;
  expected_answer?: string | null;
}

/**
 * Resolve a worked-steps list for a question. Prefers the computed numbers-in
 * walkthrough (Path B); otherwise reuses the question's existing hint/scaffolding
 * text (Path A). Returns null when there is nothing usable, so the card falls
 * back to its generic "how to fix it" tip rather than an empty or answer-only list.
 */
export function buildWorkedSteps(q?: WorkedStepsSource | null): string[] | null {
  if (!q) return null;

  // Path B wins when available — it speaks to this question's actual numbers.
  if (q.working_steps && q.working_steps.length > 0) return q.working_steps;

  const steps: string[] = [];
  const push = (t?: string | null) => {
    const v = t?.trim();
    if (v && !steps.includes(v)) steps.push(v);
  };

  // Prefer the authored hint progression: what to do, then the first step worked.
  push(q.hints?.process);
  push(q.hints?.worked);
  // Only reach for scaffolding notes when the hints gave us nothing.
  if (steps.length === 0) push(q.scaffolding_notes);

  // Nothing reusable — let the card show its generic fix instead.
  if (steps.length === 0) return null;

  // Land on the real answer so the walkthrough resolves.
  const answer = q.expected_answer?.trim();
  if (answer) push(`So the answer is ${answer}.`);

  return steps;
}

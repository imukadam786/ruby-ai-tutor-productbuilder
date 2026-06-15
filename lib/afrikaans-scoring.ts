// ─── Afrikaans FAL answer scoring (shared client + server) ───────────────────
//
// Single source of truth for scoring a deterministic Afrikaans FAL answer. The
// learner taps / chooses / listens (no free-text LLM judge), so every answer is
// checked by exact (normalised) comparison. The server route scores
// authoritatively; the client uses the SAME function to show feedback instantly
// (the expected answer ships with the question).

function norm(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

// Deterministic grading — no LLM rubric judge. The learner taps / chooses /
// listens, so every answer is checked by exact (normalised) comparison.
export function scoreAfrikaans(
  inputType: string,
  studentAnswer: string,
  expectedAnswer: string | number,
): boolean {
  const exp = norm(expectedAnswer);
  const stu = norm(studentAnswer);
  if (!stu) return false;

  switch (inputType) {
    case "sequence": {
      // Stored as comma-separated order — compare item-by-item after trimming.
      const expParts = exp.split(",").map((s) => s.trim());
      const stuParts = stu.split(",").map((s) => s.trim());
      if (expParts.length !== stuParts.length) return false;
      return expParts.every((p, i) => p === stuParts[i]);
    }
    case "true-false": {
      // Afrikaans true-false items use full-text options ("Yes, they rhyme"),
      // so the client posts the chosen option text — exact match handles it.
      const truthy = new Set(["true", "t", "yes", "y", "1", "ja"]);
      const falsy = new Set(["false", "f", "no", "n", "0", "nee"]);
      const expBool = truthy.has(exp) ? "true" : falsy.has(exp) ? "false" : exp;
      const stuBool = truthy.has(stu) ? "true" : falsy.has(stu) ? "false" : stu;
      return expBool === stuBool;
    }
    case "text":
    case "choice":
    case "image-match":
    case "cloze":
    default:
      return exp === stu;
  }
}

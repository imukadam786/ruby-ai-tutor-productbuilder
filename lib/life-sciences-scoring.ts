// ─── Life Sciences answer scoring (shared client + server) ───────────────────
//
// Single source of truth for scoring a deterministic (non-free-text) Life
// Sciences answer. The server route scores authoritatively; the client uses the
// SAME function to show feedback instantly (the expected answer ships with the
// question). short-response is NOT scored here — it needs the server LLM judge.

function norm(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

/** True for input types whose correctness can be decided without the LLM. */
export function isDeterministicLifeSciencesType(inputType: string): boolean {
  return inputType !== "short-response";
}

export function scoreLifeSciences(
  inputType: string,
  studentAnswer: string,
  expectedAnswer: string | number,
): boolean {
  const exp = norm(expectedAnswer);
  const stu = norm(studentAnswer);
  if (!stu) return false;

  switch (inputType) {
    case "true-false": {
      const truthy = new Set(["true", "t", "yes", "y", "1"]);
      const falsy = new Set(["false", "f", "no", "n", "0"]);
      const expBool = truthy.has(exp) ? "true" : falsy.has(exp) ? "false" : exp;
      const stuBool = truthy.has(stu) ? "true" : falsy.has(stu) ? "false" : stu;
      return expBool === stuBool;
    }
    // sequence in Life Sciences is rendered as MCQ (the option IS the full
    // ordering string), so a plain equality check is correct here.
    case "sequence":
    case "choice":
    case "cloze":
    case "match":
    case "scenario":
    case "diagram-label":
    case "data-interpret":
    default:
      return exp === stu;
  }
}

// ─── NST (Natural Sciences & Technology) answer scoring (shared client + server) ──
//
// Single source of truth for scoring a deterministic NST answer. The server
// route scores authoritatively; the client uses the SAME function to show
// feedback instantly (the expected answer ships with the question). All NST
// input types are deterministic — there is no LLM judge.

function norm(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

export function scoreNst(
  inputType: string,
  studentAnswer: string,
  expectedAnswer: string | number,
): boolean {
  const exp = norm(expectedAnswer);
  const stu = norm(studentAnswer);
  if (!stu) return false;

  switch (inputType) {
    case "sequence": {
      const expParts = exp.split(",").map((s) => s.trim());
      const stuParts = stu.split(",").map((s) => s.trim());
      if (expParts.length !== stuParts.length) return false;
      return expParts.every((p, i) => p === stuParts[i]);
    }
    case "true-false": {
      const truthy = new Set(["true", "t", "yes", "y", "1"]);
      const falsy = new Set(["false", "f", "no", "n", "0"]);
      const expBool = truthy.has(exp) ? "true" : falsy.has(exp) ? "false" : exp;
      const stuBool = truthy.has(stu) ? "true" : falsy.has(stu) ? "false" : stu;
      return expBool === stuBool;
    }
    case "numeric": {
      const expNum = Number(expectedAnswer);
      const stuNum = Number(studentAnswer);
      if (Number.isFinite(expNum) && Number.isFinite(stuNum)) {
        return expNum === stuNum;
      }
      return exp === stu;
    }
    case "text":
    case "choice":
    case "image-match":
    default:
      // For text items, accept any non-empty answer as correct (the bank's
      // expected is illustrative — many text questions have multiple valid
      // answers). The memo always shows what good answers look like.
      if (inputType === "text") return stu.length > 0;
      return exp === stu;
  }
}

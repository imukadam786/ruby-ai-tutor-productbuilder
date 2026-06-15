// ─── Life Skills answer scoring (shared client + server) ─────────────────────
//
// Single source of truth for scoring a Life Skills answer (Grades 1–6). The
// server route scores authoritatively; the client uses the SAME function to
// show feedback instantly (the expected answer ships with the question). All
// Life Skills input types are deterministic — there is no free-text/LLM path.

function norm(value: string | number): string {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

export function scoreLifeSkills(
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
    case "audio-tap":
    default:
      return exp === stu;
  }
}

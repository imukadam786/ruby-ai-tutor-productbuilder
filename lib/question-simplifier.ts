import { GeneratedQuestion } from "@/types/ruby";

const SUBSTITUTIONS: [RegExp, string][] = [
  [/\bcalculate\b/gi, "find"],
  [/\bdetermine\b/gi, "find"],
  [/\bsolution\b/gi, "answer"],
  [/\bcompute\b/gi, "work out"],
  [/\bevaluate\b/gi, "work out"],
  [/\bexpression\b/gi, "sum"],
  [/\bpurchases\b/gi, "buys"],
  [/\bremaining\b/gi, "left"],
  [/\breceives\b/gi, "gets"],
  [/\brepresents\b/gi, "shows"],
  [/\bdistributes\b/gi, "gives out"],
  [/\bhow many more\b/gi, "what is the difference"],
];

export function simplifyText(text: string, readingLevel: number): string {
  if (readingLevel >= 5) return text;
  return SUBSTITUTIONS.reduce((t, [pattern, replacement]) => t.replace(pattern, replacement), text);
}

export function simplifyQuestion(question: GeneratedQuestion, readingLevel: number): GeneratedQuestion {
  if (readingLevel >= 5) return question;
  return {
    ...question,
    question: simplifyText(question.question, readingLevel),
    hint: question.hint ? simplifyText(question.hint, readingLevel) : question.hint,
  };
}

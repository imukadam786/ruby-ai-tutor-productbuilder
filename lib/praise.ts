import praiseI18n from "@/data/praise-i18n.json";

// Correct-answer praise, pre-translated into every supported language by
// scripts/generate-praise-i18n.mjs → data/praise-i18n.json. Looking it up here
// means a correct answer costs NO LLM call (wrong-answer feedback is still
// translated live by lib/language-utils.ts#localiseFeedback).

type PraiseTier = "early" | "mid" | "senior" | "senior_hard";
type PraiseTable = Record<string, Record<PraiseTier, string[]>>;

const TABLE = praiseI18n as PraiseTable;

function praiseTier(grade: number, difficulty: number): PraiseTier {
  if (grade <= 3) return "early";
  if (grade <= 7) return "mid";
  if (difficulty >= 4) return "senior_hard"; // senior: acknowledge hard questions
  return "senior";
}

/**
 * A random correct-answer praise string in the learner's language, chosen from
 * the right age/difficulty tier. Falls back to English for an unknown language
 * or a missing tier.
 */
export function selectPraise(grade: number, difficulty: number, language?: string): string {
  const tier = praiseTier(grade, difficulty);
  const byLang = (language && TABLE[language]) || TABLE.English;
  const pool = byLang[tier] ?? TABLE.English[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}

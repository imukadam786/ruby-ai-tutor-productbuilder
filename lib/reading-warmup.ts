// Phase 2 warmup task definitions and session selection logic

export const WARMUP_SKILL_IDS = [
  "R1.T2.A2", // Q15 - Syllable Segmentation
  "R1.T3.A2", // Q16 - Phoneme Deletion
  "R1.T3.A3", // Q17 - Phoneme Sequencing
  "R2.T1.A3", // Q24 - CVC Encoding
  "R2.T3.A2", // Q25 - Complex Clusters
  "R4.T1.A2", // Q18 - Sequencing & Main Idea
  "R4.T2.A2", // Q19 - Context Clues
  "R4.T3.A1", // Q20 - Text Structure
  "R4.T3.A2", // Q21 - Cause & Effect
  "R5.T1.A2", // Q23 - Author Intent
  "R5.T2.A1", // Q22 - Vocabulary in Context
] as const;

export type WarmupSkillId = (typeof WARMUP_SKILL_IDS)[number];

// Map skill ID → bank question ID
export const WARMUP_QUESTION_ID: Record<string, string> = {
  "R1.T2.A2": "Q15",
  "R1.T3.A2": "Q16",
  "R1.T3.A3": "Q17",
  "R4.T1.A2": "Q18",
  "R4.T2.A2": "Q19",
  "R4.T3.A1": "Q20",
  "R4.T3.A2": "Q21",
  "R5.T2.A1": "Q22",
  "R5.T1.A2": "Q23",
  "R2.T1.A3": "Q24",
  "R2.T3.A2": "Q25",
};

export const WARMUP_SKILL_LABELS: Record<string, string> = {
  "R1.T2.A2": "Syllable Segmentation",
  "R1.T3.A2": "Phoneme Deletion",
  "R1.T3.A3": "Phoneme Sequencing",
  "R2.T1.A3": "CVC Spelling",
  "R2.T3.A2": "Complex Clusters",
  "R4.T1.A2": "Reading Sequence",
  "R4.T2.A2": "Context Clues",
  "R4.T3.A1": "Text Structure",
  "R4.T3.A2": "Cause & Effect",
  "R5.T1.A2": "Author's Purpose",
  "R5.T2.A1": "Word Meaning",
};

export const WARMUP_PER_SESSION = 3;

export interface WarmupBankQuestion {
  id: string;
  domain: string;
  domainCode: string;
  phase: number;
  skillId: string;
  question: string;
  displayWord?: string;
  answerMode: "choice" | "voice";
  choices?: Array<{ label: string; value: string; correct: boolean }>;
  expectedAnswer?: string;
  passage?: string;
  sentence?: string;
  text?: string;
}

export interface WarmupResult {
  skillId: string;
  questionId: string;
  correct: boolean;
  response: string;
}

/** Returns skill IDs not yet warmup-tested for this student */
export function getPendingWarmupSkills(profile: { warmupSkillsCompleted?: string[] }): string[] {
  const completed = profile.warmupSkillsCompleted ?? [];
  return [...WARMUP_SKILL_IDS].filter((id) => !completed.includes(id));
}

/** Returns up to WARMUP_PER_SESSION skills for the current session */
export function selectSessionWarmupSkills(profile: { warmupSkillsCompleted?: string[] }): string[] {
  return getPendingWarmupSkills(profile).slice(0, WARMUP_PER_SESSION);
}

/** True if there are any warmup tasks remaining */
export function hasWarmupTasksRemaining(profile: { warmupSkillsCompleted?: string[] }): boolean {
  return getPendingWarmupSkills(profile).length > 0;
}

/** Loads warmup questions for the given skill IDs from a bank file */
export async function loadWarmupQuestions(
  skillIds: string[],
  bankIndex: number
): Promise<WarmupBankQuestion[]> {
  try {
    const bank = await import(`@/data/question-banks/${bankIndex}.json`);
    const questions: WarmupBankQuestion[] = bank.default ?? bank;
    return skillIds
      .map((skillId) => {
        const qId = WARMUP_QUESTION_ID[skillId];
        return questions.find((q) => q.id === qId && q.phase === 2);
      })
      .filter((q): q is WarmupBankQuestion => q !== undefined);
  } catch {
    return [];
  }
}

/** Normalise a voice response string for comparison */
export function normaliseResponse(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

/** Score a voice response against an expected answer */
export function scoreVoiceWarmup(transcript: string, expected: string): boolean {
  const t = normaliseResponse(transcript);
  const e = normaliseResponse(expected);
  if (!t) return false;
  if (t === e || t.includes(e) || e.includes(t)) return true;
  const overlap = [...e].filter((c) => t.includes(c)).length / e.length;
  return overlap >= 0.75;
}

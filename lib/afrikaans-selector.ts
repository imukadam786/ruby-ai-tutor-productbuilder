/**
 * Afrikaans FAL question selector. Cloned from lib/life-skills-selector.ts,
 * adapted for the language-subject bank shape.
 *
 * Bank shape difference vs Life Skills: items live under `skills` (keyed by the
 * atomic skill id, e.g. "AF.G1.KLK.01") rather than `topics`. The skill id IS
 * the selection key — there is no separate topic id. Each item additionally
 * carries `audio` (Afrikaans to speak aloud) and `image_refs` (image-match keys),
 * which are carried through to the rendered question.
 */

import afrikaansBankData from "@/data/afrikaans-question-bank.json";
import type {
  AfrikaansBank,
  AfrikaansBankQuestion,
  AfrikaansGeneratedQuestion,
  AfrikaansSkillBankEntry,
  AfrikaansStudentProfile,
} from "@/types/afrikaans";

const bank = afrikaansBankData as unknown as AfrikaansBank;

// ─── Skill lookup ─────────────────────────────────────────────────────────────

/** The atomic skill id IS the bank key — so this just confirms the entry exists. */
export function getDomainForSkill(skillId: string): string | null {
  if (bank.skills[skillId]) return skillId;
  return null;
}

export function getSkill(skillId: string): AfrikaansSkillBankEntry | null {
  return bank.skills[skillId] ?? null;
}

// ─── Question selection ───────────────────────────────────────────────────────

/**
 * Selects a question from the skill's pool, excluding already-used refs.
 * When the pool is exhausted the full pool resets so the learner can keep going.
 *
 * @param skillId      e.g. "AF.G1.KLK.01"
 * @param usedRefs     refs already shown to this learner for this skill
 * @param isReteach    prefer easier items when items are difficulty-tagged
 * @param abilityLevel when provided + items have difficulty tags, prefer ZPD match
 */
export function selectQuestion(
  skillId: string,
  usedRefs: string[],
  isReteach = false,
  abilityLevel?: number,
): AfrikaansBankQuestion | null {
  const skill = bank.skills[skillId];
  if (!skill) return null;

  const pool = skill.questions;
  if (pool.length === 0) return null;

  let available = pool.filter((q) => !usedRefs.includes(q.ref));
  if (available.length === 0) {
    available = [...pool];
  }

  // ── Difficulty-matched selection (used when items are difficulty-tagged) ──
  if (abilityLevel !== undefined) {
    const target = isReteach ? Math.max(1, abilityLevel - 1) : abilityLevel;

    const exact = available.filter(
      (q) => q.difficulty !== undefined && q.difficulty === target,
    );
    if (exact.length > 0) {
      return exact[Math.floor(Math.random() * exact.length)];
    }

    const near = available.filter(
      (q) => q.difficulty !== undefined && Math.abs(q.difficulty - target) <= 1,
    );
    if (near.length > 0) {
      return near[Math.floor(Math.random() * near.length)];
    }
  }

  return available[Math.floor(Math.random() * available.length)];
}

// ─── Profile bookkeeping ──────────────────────────────────────────────────────

export function markQuestionUsed(
  profile: AfrikaansStudentProfile,
  skillId: string,
  questionRef: string,
): AfrikaansStudentProfile {
  const existing = profile.used_questions?.[skillId] || [];
  return {
    ...profile,
    used_questions: {
      ...(profile.used_questions || {}),
      [skillId]: [...existing, questionRef],
    },
  };
}

export function getUsedRefs(profile: AfrikaansStudentProfile, skillId: string): string[] {
  return profile.used_questions?.[skillId] || [];
}

// ─── Build a generated question from a bank question ─────────────────────────

export function bankQuestionToGenerated(
  q: AfrikaansBankQuestion,
  skillId: string,
): AfrikaansGeneratedQuestion {
  return {
    id: `q_af_${skillId}_${q.ref}_${Date.now()}`,
    skill_id: skillId,
    question_ref: q.ref,
    input_type: q.input_type,
    question: q.question,
    ruby_prompt: q.ruby_prompt,
    // Carry the Afrikaans audio + image-match keys through to the renderer.
    audio: q.audio,
    context: q.context,
    image_refs: q.image_refs,
    options: q.options,
    expected_answer: q.expected,
    memo: q.memo,
    difficulty: q.difficulty,
  };
}

// ─── Skill-level metadata ─────────────────────────────────────────────────────

export function listSkillsForGrade(grade: number): Array<{ id: string; skill: AfrikaansSkillBankEntry }> {
  return Object.entries(bank.skills)
    .filter(([, s]) => s.grade === grade)
    .map(([id, skill]) => ({ id, skill }));
}

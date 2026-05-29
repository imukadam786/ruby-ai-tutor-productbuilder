/**
 * Life Sciences question selector. Mirrors lib/life-skills-selector.ts.
 *
 * Bank shape: items live under `topics` (keyed by atomic skill id, e.g.
 * "LSC.G10.S1.CHEM.A1"). Each topic is 1:1 with a skill — the topic_id IS
 * the skill_id. FET rule: 20-item pool per topic, 60% pass mark, no timer.
 */

import lifeSciencesBankData from "@/data/life-sciences-question-bank.json";
import type {
  LifeSciencesBank,
  LifeSciencesBankQuestion,
  LifeSciencesGeneratedQuestion,
  LifeSciencesStudentProfile,
  LifeSciencesTopic,
} from "@/types/life-sciences";

const bank = lifeSciencesBankData as unknown as LifeSciencesBank;

// ─── Topic lookup ─────────────────────────────────────────────────────────────

/** Topics are 1:1 with skills — the topic_id IS the skill_id. */
export function getDomainForSkill(skillId: string): string | null {
  if (bank.topics[skillId]) return skillId;
  return null;
}

export function getTopic(topicId: string): LifeSciencesTopic | null {
  return bank.topics[topicId] ?? null;
}

// ─── Question selection ───────────────────────────────────────────────────────

/**
 * Picks the next question, excluding already-used refs. When the pool is
 * exhausted the full pool resets so the learner can keep going (covers the
 * rare case of running past target_item_count).
 *
 * @param topicId        e.g. "LSC.G10.S1.CHEM.A1"
 * @param usedRefs       refs already shown to this student for this skill
 * @param isReteach      when true, prefer items one difficulty step easier
 * @param skillId        ignored (topic IS the skill)
 * @param abilityLevel   when provided, prefer ZPD-matched difficulty
 */
export function selectQuestion(
  topicId: string,
  usedRefs: string[],
  isReteach = false,
  _skillId = "",
  abilityLevel?: number,
): LifeSciencesBankQuestion | null {
  const topic = bank.topics[topicId];
  if (!topic) return null;

  const pool = topic.questions;
  if (pool.length === 0) return null;

  let available = pool.filter((q) => !usedRefs.includes(q.ref));
  if (available.length === 0) {
    available = [...pool];
  }

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
  profile: LifeSciencesStudentProfile,
  topicId: string,
  questionRef: string,
): LifeSciencesStudentProfile {
  const existing = profile.used_questions?.[topicId] || [];
  return {
    ...profile,
    used_questions: {
      ...(profile.used_questions || {}),
      [topicId]: [...existing, questionRef],
    },
  };
}

export function getUsedRefs(
  profile: LifeSciencesStudentProfile,
  topicId: string,
): string[] {
  return profile.used_questions?.[topicId] || [];
}

// ─── Build a generated question from a bank question ─────────────────────────

export function bankQuestionToGenerated(
  q: LifeSciencesBankQuestion,
  skillId: string,
): LifeSciencesGeneratedQuestion {
  return {
    id: `q_lsc_${skillId}_${q.ref}_${Date.now()}`,
    skill_id: skillId,
    question_ref: q.ref,
    input_type: q.input_type,
    question: q.question,
    options: q.options,
    expected_answer: q.expected,
    memo: q.memo,
    difficulty: q.difficulty,
    context: q.context,
    image_refs: q.image_refs,
    data: q.data,
    rubric: q.rubric,
  };
}

// ─── Topic-level metadata ─────────────────────────────────────────────────────

export function listTopicsForLevel(
  level: number,
): Array<{ id: string; topic: LifeSciencesTopic }> {
  return Object.entries(bank.topics)
    .filter(([, t]) => t.grade === level)
    .map(([id, topic]) => ({ id, topic }));
}

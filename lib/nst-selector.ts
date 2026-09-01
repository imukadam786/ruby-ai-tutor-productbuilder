/**
 * Natural Sciences & Technology question selector. Mirrors
 * lib/life-skills-selector.ts.
 *
 * Bank shape: NST items live under `topics` keyed by topic_id
 * (e.g. "NST.L4.LL.T01"). Each topic is 1:1 with a skill — so for NST,
 * the topic_id IS the domain. No level-fallback table, no sub-pool
 * filtering: bank-curated per topic.
 */

import nstBankData from "@/data/nst-question-bank.json";
import type {
  NstBank,
  NstBankQuestion,
  NstGeneratedQuestion,
  NstStudentProfile,
  NstTopic,
} from "@/types/nst";

const bank = nstBankData as unknown as NstBank;

// ─── Topic lookup ─────────────────────────────────────────────────────────────

/** Topics are 1:1 with skills today — the topic_id IS the skill_id. */
export function getDomainForSkill(skillId: string): string | null {
  if (bank.topics[skillId]) return skillId;
  return null;
}

export function getTopic(topicId: string): NstTopic | null {
  return bank.topics[topicId] ?? null;
}

// ─── Question selection ───────────────────────────────────────────────────────

/**
 * Selects a question from the pool, excluding already-used refs.
 * When the pool is exhausted the full pool resets so the learner can keep going.
 *
 * @param topicId        e.g. "NST.L4.LL.T01"
 * @param usedRefs       refs already shown to this student for this skill
 * @param isReteach      reserved for future use (prefer easier items); currently no-op
 *                       since IP items don't all carry difficulty tags
 * @param skillId        ignored for NST (topic IS the skill)
 * @param abilityLevel   when provided + items have difficulty tags, prefer ZPD match
 */
export function selectQuestion(
  topicId: string,
  usedRefs: string[],
  isReteach = false,
  _skillId = "",
  abilityLevel?: number,
): NstBankQuestion | null {
  const topic = bank.topics[topicId];
  if (!topic) return null;

  const pool = topic.questions;
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
  profile: NstStudentProfile,
  topicId: string,
  questionRef: string,
): NstStudentProfile {
  const existing = profile.used_questions?.[topicId] || [];
  return {
    ...profile,
    used_questions: {
      ...(profile.used_questions || {}),
      [topicId]: [...existing, questionRef],
    },
  };
}

export function getUsedRefs(profile: NstStudentProfile, topicId: string): string[] {
  return profile.used_questions?.[topicId] || [];
}

// ─── Build a generated question from a bank question ─────────────────────────

export function bankQuestionToGenerated(
  q: NstBankQuestion,
  skillId: string,
): NstGeneratedQuestion {
  return {
    id: `q_nst_${skillId}_${q.ref}_${Date.now()}`,
    skill_id: skillId,
    question_ref: q.ref,
    input_type: q.input_type,
    question: q.question,
    ruby_prompt: q.ruby_prompt,
    context: q.context,
    options: q.options,
    image_refs: q.image_refs,
    expected_answer: q.expected,
    memo: q.memo,
    error_signals: q.error_signals ?? [],
    difficulty: q.difficulty,
  };
}

// ─── Topic-level metadata ─────────────────────────────────────────────────────

export function listTopicsForLevel(level: number): Array<{ id: string; topic: NstTopic }> {
  return Object.entries(bank.topics)
    .filter(([, t]) => t.grade === level)
    .map(([id, topic]) => ({ id, topic }));
}

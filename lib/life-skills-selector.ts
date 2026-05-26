/**
 * Life Skills question selector. Mirrors lib/question-selector.ts (Maths),
 * adapted for Foundation Phase content.
 *
 * Bank shape difference vs Maths: Life Skills items live under `topics`
 * (keyed by topic_id, e.g. "LS.L1.BKH.T01") rather than `domains`. Each
 * topic is 1:1 with a skill — so for Life Skills, the topic_id IS the
 * domain. No level-fallback table, no sub-pool filtering: bank-curated
 * per topic.
 */

import lifeSkillsBankData from "@/data/life-skills-question-bank.json";
import type {
  LifeSkillsBank,
  LifeSkillsBankQuestion,
  LifeSkillsGeneratedQuestion,
  LifeSkillsStudentProfile,
  LifeSkillsTopic,
} from "@/types/life-skills";

const bank = lifeSkillsBankData as unknown as LifeSkillsBank;

// ─── Topic lookup ─────────────────────────────────────────────────────────────

/** Topics are 1:1 with skills today — the topic_id IS the skill_id. */
export function getDomainForSkill(skillId: string): string | null {
  if (bank.topics[skillId]) return skillId;
  return null;
}

export function getTopic(topicId: string): LifeSkillsTopic | null {
  return bank.topics[topicId] ?? null;
}

// ─── Question selection ───────────────────────────────────────────────────────

/**
 * Selects a question from the pool, excluding already-used refs.
 * When the pool is exhausted the full pool resets so the learner can keep going.
 *
 * @param topicId        e.g. "LS.L1.BKH.T01"
 * @param usedRefs       refs already shown to this student for this skill
 * @param isReteach      reserved for future use (prefer easier items); currently no-op
 *                       since Foundation-Phase items don't all carry difficulty tags
 * @param skillId        ignored for Life Skills (topic IS the skill)
 * @param abilityLevel   when provided + items have difficulty tags, prefer ZPD match
 */
export function selectQuestion(
  topicId: string,
  usedRefs: string[],
  isReteach = false,
  _skillId = "",
  abilityLevel?: number,
): LifeSkillsBankQuestion | null {
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
  profile: LifeSkillsStudentProfile,
  topicId: string,
  questionRef: string,
): LifeSkillsStudentProfile {
  const existing = profile.used_questions?.[topicId] || [];
  return {
    ...profile,
    used_questions: {
      ...(profile.used_questions || {}),
      [topicId]: [...existing, questionRef],
    },
  };
}

export function getUsedRefs(profile: LifeSkillsStudentProfile, topicId: string): string[] {
  return profile.used_questions?.[topicId] || [];
}

// ─── Build a generated question from a bank question ─────────────────────────

export function bankQuestionToGenerated(
  q: LifeSkillsBankQuestion,
  skillId: string,
): LifeSkillsGeneratedQuestion {
  return {
    id: `q_ls_${skillId}_${q.ref}_${Date.now()}`,
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
    difficulty: q.difficulty,
  };
}

// ─── Topic-level metadata ─────────────────────────────────────────────────────

export function listTopicsForLevel(level: number): Array<{ id: string; topic: LifeSkillsTopic }> {
  return Object.entries(bank.topics)
    .filter(([, t]) => t.grade === level)
    .map(([id, topic]) => ({ id, topic }));
}

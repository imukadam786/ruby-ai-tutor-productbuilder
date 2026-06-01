/**
 * Geography question selector. Direct mirror of lib/history-selector.ts.
 *
 * Bank shape: items live under `topics` (keyed by atomic skill id, e.g.
 * "GEO.G10.MAP.A1"). Each topic is 1:1 with a skill — the topic_id IS the
 * skill_id. FET rule: 20-item pool per topic, 60% pass mark, no timer.
 *
 * Per-mechanic `expected` payload handling lives in lib/geography-scoring.ts.
 * This file just shuffles items and converts bank → generated shape.
 */

import geographyBankData from "@/data/geography-question-bank.json";
import type {
  GeographyBank,
  GeographyBankQuestion,
  GeographyGeneratedQuestion,
  GeographyTopic,
} from "@/types/geography";

const bank = geographyBankData as unknown as GeographyBank;

// ─── Topic lookup ─────────────────────────────────────────────────────────────

/** Topics are 1:1 with skills — the topic_id IS the skill_id. */
export function getDomainForSkill(skillId: string): string | null {
  if (bank.topics[skillId]) return skillId;
  return null;
}

export function getTopic(topicId: string): GeographyTopic | null {
  return bank.topics[topicId] ?? null;
}

// ─── Question selection ───────────────────────────────────────────────────────

/**
 * Picks the next question, excluding already-used refs. When the pool is
 * exhausted the full pool resets so the learner can keep going.
 *
 * @param topicId        e.g. "GEO.G10.MAP.A1"
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
): GeographyBankQuestion | null {
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

// ─── Build a generated question from a bank question ─────────────────────────

export function bankQuestionToGenerated(
  q: GeographyBankQuestion,
  skillId: string,
): GeographyGeneratedQuestion {
  return {
    id: `q_geo_${skillId}_${q.ref}_${Date.now()}`,
    skill_id: skillId,
    question_ref: q.ref,
    input_type: q.input_type,
    question: q.question,
    options: q.options,
    expected_answer: q.expected ?? "",
    memo: q.memo,
    difficulty: q.difficulty,
    context: q.context,
    image_refs: q.image_refs,
    source: q.source,
    data: q.data,
    buckets: q.buckets,
    items: q.items,
    pass_threshold: q.pass_threshold,
    expected_order: q.expected_order,
    source_text: q.source_text,
    task: q.task,
    targets: q.targets,
    min_correct: q.min_correct,
    max_wrong: q.max_wrong,
  };
}

// ─── Topic-level metadata ─────────────────────────────────────────────────────

export function listTopicsForLevel(
  level: number,
): Array<{ id: string; topic: GeographyTopic }> {
  return Object.entries(bank.topics)
    .filter(([, t]) => t.grade === level)
    .map(([id, topic]) => ({ id, topic }));
}

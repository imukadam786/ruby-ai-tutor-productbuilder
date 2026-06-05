/**
 * Economics question selector. Direct mirror of lib/accounting-selector.ts.
 *
 * Bank shape: items live under `topics` (keyed by atomic skill id, e.g.
 * "ECON.G10.T1.CONCEPTS.A1"). Each topic is 1:1 with a skill — the topic_id IS
 * the skill_id. FET rule: 20-item pool per topic, 60% pass mark, no timer.
 *
 * Per-mechanic `expected` payload handling lives in lib/economics-scoring.ts.
 * This file just shuffles items and converts bank → generated shape.
 */

import economicsBankData from "@/data/economics-question-bank.json";
import type {
  EconomicsBank,
  EconomicsBankQuestion,
  EconomicsGeneratedQuestion,
  EconomicsTopic,
} from "@/types/economics";

const bank = economicsBankData as unknown as EconomicsBank;

// ─── Topic lookup ─────────────────────────────────────────────────────────────

/** Topics are 1:1 with skills — the topic_id IS the skill_id. */
export function getDomainForSkill(skillId: string): string | null {
  if (bank.topics[skillId]) return skillId;
  return null;
}

export function getTopic(topicId: string): EconomicsTopic | null {
  return bank.topics[topicId] ?? null;
}

// ─── Question selection ───────────────────────────────────────────────────────

/**
 * Picks the next question, excluding already-used refs. When the pool is
 * exhausted the full pool resets so the learner can keep going.
 */
export function selectQuestion(
  topicId: string,
  usedRefs: string[],
  isReteach = false,
  _skillId = "",
  abilityLevel?: number,
): EconomicsBankQuestion | null {
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
  q: EconomicsBankQuestion,
  skillId: string,
): EconomicsGeneratedQuestion {
  return {
    id: `q_econ_${skillId}_${q.ref}_${Date.now()}`,
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
    source: q.source,
    buckets: q.buckets,
    items: q.items,
    pass_threshold: q.pass_threshold,
    source_text: q.source_text,
    task: q.task,
    targets: q.targets,
    min_correct: q.min_correct,
    max_wrong: q.max_wrong,
    thesis: q.thesis,
    pool: q.pool,
    pick_n: q.pick_n,
    prompt: q.prompt,
    template: q.template,
    source_a: q.source_a,
    source_b: q.source_b,
    statements: q.statements,
  };
}

// ─── Topic-level metadata ─────────────────────────────────────────────────────

export function listTopicsForLevel(
  level: number,
): Array<{ id: string; topic: EconomicsTopic }> {
  return Object.entries(bank.topics)
    .filter(([, t]) => t.grade === level)
    .map(([id, topic]) => ({ id, topic }));
}
